from base64 import b64decode
from json import loads
from os import environ, path
from random import choices
from re import escape, search
from threading import Thread

from firebase_admin import credentials, db, initialize_app

try:
    from ._upload import upload
    from ._util import array_to_nodes, sanitize_str, de_nodify, remove_falsey_values
    from ._caching import cache
    from ._scrape import add_movie_from_id
except ImportError:
    from _upload import upload
    from _util import array_to_nodes, sanitize_str, de_nodify, remove_falsey_values
    from _caching import cache
    from _scrape import add_movie_from_id


def get_keys():
    c = environ.get("firebase_key")
    if c:
        return loads(b64decode(c.strip()).decode())
    else:
        with open(path.join(".", "env.json"), "r") as f:
            dx = loads(f.read())
            return dx["firebase"]


creds = credentials.Certificate(get_keys())
initialize_app(creds, {"databaseURL": "https://mdb-pycode.firebaseio.com"})


class DatabaseManager(object):
    def _update_actor_details(self, idx, name, thumbnail, movie_id):
        ref = db.reference("/actorDetails")
        actor = ref.child(idx)
        if actor.child("name").get():
            actor.child(f"movies/{movie_id}").set(1)
        else:
            search = db.reference("/searchableActorNamesToIDMap")
            search.child(sanitize_str(name)).set(idx)
            actor.set(
                {"name": name, "thumbnail": upload(thumbnail), "movies": {movie_id: 1}}
            )

    def _update_movie_details(self, data, idx):
        data["movie_thumb"] = upload(data["movie_thumb"])
        ref = db.reference("/movieDetails")
        ref.child(idx).set(data)

    def add_data(self, data_dict: dict):
        for movie_id, movie_data in data_dict.items():
            if db.reference("/movieDetails").child(movie_id).get():
                continue
            threads = set()
            actor_imgs = movie_data.pop("actor_imgs")
            actor_names = movie_data.pop("actor_names")
            for k, v in actor_names.items():
                actor_img = actor_imgs[k]
                func = self._update_actor_details
                t = Thread(target=func, args=(k, v, actor_img, movie_id))
                t.start()
                threads.add(t)
            searchable = movie_data.pop("_searchable")
            func = self._update_movie_details
            t = Thread(target=func, args=(movie_data, movie_id))
            threads.add(t)
            t.start()
            ref = db.reference("/searchableMovieTitlesToIDMap")
            ref.child(searchable).set(movie_id)
            for t in threads:
                t.join()
            ref = db.reference("totalMovieCount")
            ref.set((ref.get() or 0) + 1)

    def _id_q(self, name, idx):
        data = db.reference(f"/{name}").child(idx).get()

        return data

    def get_total_movies(self):
        return db.reference("totalMovieCount").get()

    @cache(lambda _, y: f"movie-data-by-id--{y}")
    def get_movie_data_from_id(self, idx):
        result = self._id_q("movieDetails", idx)
        if not result:
            resp = add_movie_from_id(idx)
            self.add_data({idx: resp})
            result = resp
        for i in ["summary", "tagline", "trivia"]:
            if i in result:
                self._make_node(result, i)
        # result["movie_id"] = idx
        return result

    def _make_node(self, obj, key):
        obj[key] = array_to_nodes(obj[key])

    @cache(lambda _, x: f"actor-data-by-id--{x}")
    def get_actor_data_from_id(self, idx):
        actor_details = self._id_q("actorDetails", idx)
        self._make_node(actor_details, "movies")
        return actor_details

    def get_all_movies(self):
        return db.reference("movieDetails").get()


manager = DatabaseManager()


def get_last_result(od):
    return next(reversed(od))


def search_regex(search_from, q):
    constructed_query = sanitize_str(escape(q))
    return [v for k, v in search_from.items() if search(constructed_query, k)]


def firebase_search_regex(q, reference="movie"):
    if not q:
        return []
    ref_name = {
        "movie": "searchableMovieTitlesToIDMap",
        "actor": "searchableActorNamesToIDMap",
    }
    ref = db.reference(ref_name[reference])
    results = []
    LIMIT = 100
    initial_query = ref.order_by_key().limit_to_first(LIMIT).get()
    last_result = get_last_result(initial_query)
    results = search_regex(initial_query, q)
    initial_result_len = len(initial_query)
    # Don't check further if we don't have 100 items  in total in the first place
    while initial_result_len == 100:
        next_query = (
            ref.order_by_key().start_at(last_result).limit_to_first(LIMIT).get()
        )
        next_query.pop(last_result)
        results.extend(search_regex(next_query, q))
        if len(next_query) < LIMIT:
            break
        last_result = get_last_result(next_query)
    return results


def _get_data_by_id(args, func, **kwargs):
    response = {idx: func(idx, **kwargs) for idx in args}
    return response


def firebase_get_movies_by_id(*results,):
    return _get_data_by_id(results, manager.get_movie_data_from_id)


def firebase_get_actors_by_id(*q):
    return _get_data_by_id(q, manager.get_actor_data_from_id)


def _remove_duplicates(data):
    idx_arr = []
    for i, v in enumerate(data):
        idx = v["movie_id"]
        if idx in idx_arr:
            print("removing", idx)
            data[i] = False
            continue
        idx_arr.append(idx)
    return remove_falsey_values(data)


def _get_random_results(item_arr, k):
    movie_thumb = "movie_thumb"
    movie_title = "movie_title"
    data_array = [
        {movie_thumb: v[movie_thumb], movie_title: v[movie_title], "movie_id": k}
        for k, v in item_arr
    ]
    return _remove_duplicates(choices(data_array, k=k))


def _get_thumbs(max_size, start_at=None):
    _ref = db.reference("/movieDetails").order_by_key()
    if start_at is None:
        k = 5
        ref = _ref
    else:
        k = 1
        if start_at is True:
            ref = _ref
        else:
            ref = _ref.start_at(start_at)
    movie_thumbs = ref.limit_to_first(max_size).get()
    item_arr = movie_thumbs.items()
    random_data = _get_random_results(item_arr, k)
    len_data = len(random_data)
    while len_data < k:
        next_results = _get_random_results(item_arr, k - len_data)
        random_data.extend(next_results)
        random_data = _remove_duplicates(random_data)
        len_data = len(random_data)
    return (random_data, get_last_result(movie_thumbs))


def _firebase_get_random():
    total_movies = manager.get_total_movies()
    chunk_size = total_movies // 5
    if chunk_size < 100:  # return all of em
        thumbs, _ = _get_thumbs(total_movies)
    else:
        thumbs = []
        start_at = True
        while len(thumbs) != 5:
            thumb, start_at = _get_thumbs(chunk_size, start_at)
            thumbs.extend(thumb)
    return array_to_nodes(thumbs)


def firebase_get_random_movies():
    return _firebase_get_random()


def firebase_get_reel():
    random = firebase_get_random_movies()
    return array_to_nodes(map(lambda x: x["movie_thumb"], de_nodify(random, True)))
