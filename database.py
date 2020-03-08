from base64 import b64decode
from json import loads
from os import environ, path
from re import escape, search
from threading import Thread

from firebase_admin import credentials, db, initialize_app

from upload import upload
from util import sanitize_str


def get_keys():
    c = environ.get("firebase-key")
    if c:
        return loads(b64decode(c.strip()).decode())
    else:
        with open(path.join(".", "env.json"), "r") as f:
            dx = loads(f.read())
            return dx["firebase"]


creds = credentials.Certificate(get_keys())
initialize_app(creds, {"databaseURL": "https://mdb-pycode.firebaseio.com"})


class DatabaseManager(object):
    def __init__(self):
        self._DB_REFERENCES = {
            "summary": self._add_summary,
            "trivia": self._add_trivia,
            "tagline": self._add_tagline,
            "credits": self._add_credits,
            "actor_names": self._add_actor_names,
            "actor_imgs": self._add_actor_img,
            "movie_thumb": self._add_movie_thumb,
            "movie_title": self._add_movie_title,
            "_searchable": self._add_searchable,
        }

    def _add__DATA(self, name, idx, data):
        ref = db.reference(name)
        ref.child(idx).set(data)

    def _add_movie_title(self, idx, t):
        return self._add__DATA("/movie_title", idx, t)

    def _add_movie_thumb(self, idx, thumb):
        return self._add__DATA("/movie_thumbs", idx, upload(thumb))

    def _add_searchable(self, idx, s):
        return self._add__DATA("/_search_by", s, idx)

    def _add_summary(self, idx, summary):
        return self._add__DATA("/summary", idx, summary)

    def _add_trivia(self, idx, trivia):
        return self._add__DATA("/trivia", idx, trivia)

    def _add_tagline(self, idx, tagline):
        return self._add__DATA("/tagline", idx, tagline)

    def _add_credits(self, idx, _credits):
        return self._add__DATA("/credits", idx, _credits)

    def _add_actor_names(self, mid, actor_dict):
        for k, v in actor_dict.items():
            ref = db.reference("/actors")
            actor = ref.child(k)
            if actor.get():
                actor.update({"movies/" + mid: 1})
            else:
                actor.update({"movies/" + mid: 1, "name": v})

    def _add_actor_img(self, _mid, actor_dict):
        for k, v in actor_dict.items():
            ref = db.reference("/actor_thumbs")
            actor = ref.child(k)
            if not actor.get():
                actor.set(upload(v["full"]))

    def add_data(self, data_dict: dict):
        for movie_id, movie_data in data_dict.items():
            if db.reference("/movie_title").child(movie_id).get():
                return False
            threads = set()
            for k, v in movie_data.items():
                func = self._DB_REFERENCES[k]
                t = Thread(target=func, args=(movie_id, v))
                t.start()
                threads.add(t)
            for thread in threads:
                thread.join()

    def _id_q(self, name, idx):
        return db.reference(f"/{name}").child(idx).get()

    def get_movie_data_from_id(self, idx):
        return {
            "movie_title": self._id_q("movie_title", idx),
            "movie_thumb": self._id_q("movie_thumbs", idx),
            "tagline": self._id_q("tagline", idx),
            "summary": self._id_q("summary", idx),
            "trivia": self._id_q("trivia", idx),
            "credits": self._id_q("credits", idx),
        }

    def get_actor_data_from_id(self, idx):
        actor_details = self._id_q("actors", idx)
        thumbs = self._id_q("actor_thumbs", idx)
        return {"info": actor_details, "thumbs": thumbs}


_manager = DatabaseManager()


def get_last_result(od):
    return next(reversed(od))


def search_regex(search_from, q):
    constructed_query = escape(sanitize_str(q))
    return [v for k, v in search_from.items() if search(constructed_query, k)]


def firebase_search_regex(q):
    ref = db.reference("_search_by")
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
    return {"searchResults": search_database(*results)}


def search_database(*results):
    response = []
    for idx in results:
        resp = _manager.get_movie_data_from_id(idx)
        response.append({"__node": resp})
    return response


def firebase_get_actors_by_id(*q):
    response = []
    for idx in q:
        resp = _manager.get_actor_data_from_id(idx)
        response.append({"__node": resp})
    return response
