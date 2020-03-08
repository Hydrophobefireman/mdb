from crawlers.search_crawler import scrape_search
from crawlers.movie_crawler import scrape_movie_data, IMDBMovieData
from constants import HOST, PROTO
from util import get_id, id_to_url, get_page, image_url_parser, sanitize_str
from urllib.parse import urljoin


def _normalize_movie_data(imdb_data: IMDBMovieData, mid: str):
    actor_id_to_name_dict = {}
    credits_dict = {"cast": {}, "director": None}
    trivia_dict = None
    summary_dict = None
    tagline_dict = None
    actor_imgs = {}
    credits_dict["director"] = imdb_data.credits.get("directed_by")
    for (k, v) in imdb_data.credits.get("cast_map", {}).items():
        idx = v["imdb_data"]["id"]
        credits_dict["cast"][idx] = v["character_played"]
        actor_id_to_name_dict[idx] = k
        actor_imgs[idx] = v["thumbnail"]
    tagline_dict = imdb_data.tagline.get("taglines")
    trivia_dict = imdb_data.trivia.get("trivia")
    summary_dict = imdb_data.summary.get("summaries")
    return {
        "summary": summary_dict,
        "trivia": trivia_dict,
        "tagline": tagline_dict,
        "credits": credits_dict,
        "actor_names": actor_id_to_name_dict,
        "actor_imgs": actor_imgs,
    }


def get_movie_from_url(url: str,):
    return get_movie_from_id(get_id(url))


def add_movie_from_id(idx) -> dict:
    url = id_to_url(idx)
    page = get_page(url)
    title = page.title.text.replace("- IMDb", "").strip()
    thumb = image_url_parser(
        page.find("meta", attrs={"property": "og:image"}).attrs.get("content")
    )
    _searchable = sanitize_str(title)
    data = _prepare_results(idx, thumb, title, _searchable)
    return data


def _prepare_results(idx, thumb, title, searchable_title):
    dct = get_movie_from_id(idx)
    dct["movie_thumb"] = thumb
    dct["movie_title"] = title
    dct["_searchable"] = searchable_title
    return dct


def add_movies(q):
    results = scrape_search(q)
    data_dict = {}
    for result in results:
        idx = result.movie_id
        thumb = result.thumbnail
        title = result.title
        searchable_title = result.searchable_title
        data_dict[idx] = _prepare_results(idx, thumb, title, searchable_title)
    return data_dict


def get_movie_from_id(idx: str):
    data = scrape_movie_data(idx)
    return _normalize_movie_data(data, idx)

