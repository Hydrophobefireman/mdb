from urllib.parse import urljoin

try:
    from ._constants import HOST, PROTO
    from ._util import get_id, get_page, id_to_url, image_url_parser, sanitize_str
    from .crawlers._movie_crawler import IMDBMovieData, scrape_movie_data
    from .crawlers._search_crawler import scrape_search

except ImportError:
    from _constants import HOST, PROTO
    from _util import get_id, get_page, id_to_url, image_url_parser, sanitize_str
    from crawlers._movie_crawler import IMDBMovieData, scrape_movie_data
    from crawlers._search_crawler import scrape_search


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


def scrape_meta_data(page):
    time = page.find("time")
    time = time.text.strip() if time else None
    div = page.find("div", attrs={"class": "subtext"})
    genres = []
    release_date = None
    if div is not None:
        anchors = div.find_all("a")
        if anchors:
            date = anchors[-1]
            release_date = date.text.strip()
            genres = [x.text.strip() for x in anchors[:-1]]

    return {"time": time, "genres": genres, "release_date": release_date}


def add_movie_from_id(idx) -> dict:
    url = id_to_url(idx)
    page = get_page(url)
    title = page.title.text.replace("- IMDb", "").strip()
    thumb = image_url_parser(
        page.find("meta", attrs={"property": "og:image"}).attrs.get("content")
    )
    _searchable = sanitize_str(title)
    meta = scrape_meta_data(page)
    data = _prepare_results(idx, thumb, title, _searchable, meta)
    return data


def _prepare_results(idx, thumb, title, searchable_title, meta):
    dct = get_movie_from_id(idx)
    dct["movie_thumb"] = thumb
    dct["meta"] = meta
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
