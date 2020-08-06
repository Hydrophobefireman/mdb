import re
from json import dumps, loads
from urllib.parse import urlparse

from flask import Flask, Response, request

try:
    from ._util import resp_template, sanitize_str
except ImportError:
    from _util import resp_template, sanitize_str
try:
    from ._api_data import (
        api_add_movies,
        api_search_firebase_actors,
        api_search_firebase_movies,
        api_search_imdb,
        api_get_movie_details,
        api_get_actor_details,
        api_get_random_movies,
        api_get_all_details,
        api_get_reel,
    )
except ImportError:
    from _api_data import (
        api_add_movies,
        api_search_firebase_actors,
        api_search_firebase_movies,
        api_search_imdb,
        api_get_movie_details,
        api_get_actor_details,
        api_get_random_movies,
        api_get_all_details,
        api_get_reel,
    )


app = Flask(__name__)


def get_query(request):
    r = request.args.get("q", "").strip()
    if not r:
        return None
    return r.split("!")


def json_resp(dict_, status=200):
    return Response(dumps(dict_), status=status, content_type="application/json")


@app.route("/query/movies/search/_/imdb/", strict_slashes=False)
def query_imdb():
    q = get_query(request)
    if not q:
        resp = []
    else:
        resp = api_search_imdb(q[0])
    return json_resp(resp_template("IMDBSearchResults", resp))


def filter_data(data):
    rd_arr = ["movie_title", "movie_thumb"]
    for x in data:
        i = data[x]
        to_pop = [key for key in i if key not in rd_arr]
        for j in to_pop:
            i.pop(j)
    return data


@app.route("/query/movies/search/", strict_slashes=False)
def query_firebase_movies():
    q = get_query(request)
    # is_auto = "isAutoComplete" in request.args

    if not q:
        data = []
    else:
        # if not is_auto:
        _resp = api_search_firebase_movies(q[0])
        data = api_get_movie_details(_resp)  # needs opt
        data = filter_data(data)
    return json_resp(resp_template("movieSearchResults", data))


@app.route("/query/actors/search/", strict_slashes=False)
def query_firebase_actors():
    q = get_query(request)
    if not q:
        resp = []
    else:
        _resp = api_search_firebase_actors(q[0])
        resp = api_get_actor_details(_resp)  # needs opt
    return json_resp(resp_template("actorSearchResults", resp))


@app.route("/query/movies/id/search/", strict_slashes=False)
def query_firebase_movies_by_id():
    q = get_query(request)
    _filter = request.args.get("filter") == "true"
    if not q:
        resp = []
    else:
        resp = api_get_movie_details(q)
        if _filter:
            resp = filter_data(resp)
    return json_resp(resp_template("movieDetails", resp))


@app.route("/query/actors/id/search/", strict_slashes=False)
def query_firebase_actors_by_id():
    q = get_query(request)
    if not q:
        resp = []
    else:
        resp = api_get_actor_details(q)
    return json_resp(resp_template("actorDetails", resp))


@app.route("/query/movies/_/imdb_add/_/", strict_slashes=False, methods=["POST"])
def add_movie():
    js = request.get_json(True)
    movie_id = js.get("id_arr", [])
    return json_resp(api_add_movies(movie_id))


@app.route("/query/get/reel.json")
def movie_reel():
    return json_resp(resp_template("movieReel", api_get_reel()))


@app.route("/query/ping/", strict_slashes=False)
def ping_api():
    return ""


@app.route("/query/get/landing.json")
def random_movie():
    return json_resp(resp_template("landingData", api_get_random_movies()))


@app.after_request
def resp_headers(resp):
    resp.headers["connection"] = "keep-alive"
    resp.headers["access-control-allow-origin"] = request.headers.get("Origin") or "*"
    return resp


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
