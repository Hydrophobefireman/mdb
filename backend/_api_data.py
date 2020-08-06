from hashlib import md5
from threading import Thread

try:
    from ._caching import IDENTITY_CACHE, cache
    from ._database import (
        firebase_get_actors_by_id,
        firebase_get_movies_by_id,
        firebase_get_random_movies,
        firebase_get_reel,
        firebase_search_regex,
        manager,
    )
    from ._scrape import add_movie_from_id, add_movies, scrape_search
    from ._util import array_to_nodes, resp_template, sanitize_str

except ImportError:
    from _caching import IDENTITY_CACHE, cache
    from _database import (
        firebase_get_actors_by_id,
        firebase_get_movies_by_id,
        firebase_get_random_movies,
        firebase_get_reel,
        firebase_search_regex,
        manager,
    )
    from _scrape import add_movie_from_id, add_movies, scrape_search
    from _util import array_to_nodes, resp_template, sanitize_str


def hashit(x):
    return md5(x.encode()).hexdigest()


def api_search_imdb(q):
    results = scrape_search(q)
    response = array_to_nodes(map(lambda x: x.as_dict, results))
    return response


def __add_movies_thread(idx):
    results = {idx: add_movie_from_id(idx)}
    manager.add_data(results)


def api_add_movies(idx_array):
    th = []
    for idx in idx_array:
        t = Thread(target=__add_movies_thread, args=(idx,))
        th.append(t)
        t.start()
    return {"success": True}


@cache(lambda x: f"movie-search-{sanitize_str(x)}")
def api_search_firebase_movies(q):
    q = sanitize_str(q)
    results = firebase_search_regex(q, "movie")
    return results


@cache(lambda x: f"actor-search-{sanitize_str(x)}")
def api_search_firebase_actors(q):
    return firebase_search_regex(q, "actor")


def api_get_movie_details(idx: list):
    results = firebase_get_movies_by_id(*idx)
    return results


# @cache(lambda x: f"actor-data-by-id-{hashit(''.join(x))}")
def api_get_actor_details(q: list):
    results = firebase_get_actors_by_id(*q)
    return results


@cache(lambda: "db-all-cache")
def api_get_all_details():
    data = manager.get_all_movies()
    req = ["movie_thumb", "movie_title"]
    for v in data.values():
        to_pop = []
        for i in v.keys():
            if i not in req:
                to_pop.append(i)
        for i in to_pop:
            v.pop(i)
        to_pop.clear()
    return data


@cache(lambda: "reel")
def api_get_reel():
    results = firebase_get_reel()
    return results


@cache(lambda: "landing")
def api_get_random_movies():
    results = firebase_get_random_movies()
    return results
