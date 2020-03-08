from scrape import scrape_search, add_movies, add_movie_from_id
from threading import Thread
from database import DatabaseManager, firebase_search_regex, firebase_get_actors_by_id

manager = DatabaseManager()


def api_search_imdb(q):
    results = scrape_search(q)
    return list(map(lambda x: x.as_dict, results))


def __add_movies_thread(idx_array):
    results = {idx: add_movie_from_id(idx) for idx in idx_array}
    manager.add_data(results)


def api_add_movies(idx_array):
    Thread(target=__add_movies_thread, args=(idx_array,)).start()
    return {"success": True}


def api_search_firebase_movies(q):
    results = firebase_search_regex(q)
    return results


def api_get_actor_details(q: list):
    results = firebase_get_actors_by_id(*q)
    return results
