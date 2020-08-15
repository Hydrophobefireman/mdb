from urllib.parse import urljoin

try:

    from .._constants import API_ROUTE, HOST, PROTO
    from .._util import (
        get_page,
        id_to_url,
        image_url_parser,
        next_table,
        remove_falsey_values,
    )
except ImportError:
    from _constants import API_ROUTE, HOST, PROTO
    from _util import (
        get_page,
        id_to_url,
        image_url_parser,
        next_table,
        remove_falsey_values,
    )


def scrape_credits(movie_id: str) -> dict:
    url = urljoin(id_to_url(movie_id), "fullcredits")
    page = get_page(url)
    directed_by = list(
        filter(
            lambda x: "directed by" in x.text.lower(),
            page.find_all("h4", {"class": "dataHeaderWithBorder"}),
        )
    )
    director = (
        next_table(directed_by[0]).text.strip() if directed_by else "%%UNKNWOWN%%"
    )
    director = director.split("\n")[0].strip()
    cast = next_table(page.find(attrs={"id": "cast"}))
    if cast is None:
        return None
    characters = cast.find_all(
        "tr", attrs={"class": lambda x: (x or "").lower().strip() in ["odd", "even"]}
    )
    cast_map = {}
    for char in characters:
        primary_pic = char.find(attrs={"class": "primary_photo"})
        link_ = primary_pic.find("a")
        actor_imdb_url = urljoin(PROTO + HOST, link_.attrs.get("href").split("?")[0])
        img = primary_pic.find("img")
        actor = (
            img.attrs.get("alt") or primary_pic.find_next("a").find_next("a").text
        ).strip()
        img_src = image_url_parser(img.attrs.get("loadlate") or img.attrs.get("src"))
        character_played = (
            char.find(attrs={"class": "character"}).text.strip().split("\n")[0].strip()
        )
        cast_map[actor] = {
            "thumbnail": img_src,
            "imdb_data": {
                "url": actor_imdb_url,
                "id": actor_imdb_url.split("/name/")[1].split("/")[0],
            },
            "character_played": character_played,
        }
    return {"directed_by": director, "cast_map": cast_map}


def scrape_taglines(movie_id: str) -> dict:
    url = urljoin(id_to_url(movie_id), "taglines")
    page = get_page(url)
    taglines = page.find_all(
        attrs={
            "class": lambda x: x
            and "soda" in x
            and any(i in x for i in ["odd", "even"])
        }
    )
    return {
        "taglines": remove_falsey_values(
            map(
                lambda x: x.text.strip()
                if "It looks like we don't have any Taglines for this title yet."
                not in x.text
                else None,
                taglines,
            )
        )
    }


def _get_summary(x):
    if not x:
        return None
    p = x.find("p")
    if not p:
        return None
    a = x.find("a")
    return {"text": p.text.strip(), "summary_by": a.text.strip() if a else None}


def scrape_summary(movie_id: str) -> dict:
    url = urljoin(id_to_url(movie_id), "plotsummary")
    page = get_page(url)
    summaries = page.find(attrs={"id": "plot-summaries-content"}).find_all("li")
    data = [_get_summary(x) for x in summaries]
    return {"summaries": remove_falsey_values(data)}


def scrape_trivia(movie_id: str) -> dict:
    url = urljoin(id_to_url(movie_id), "trivia")
    page = get_page(url)
    trivia_pieces = list(
        map(lambda x: x.text.strip(), page.find_all("div", attrs={"class": "sodatext"}))
    )
    return {"trivia": trivia_pieces}


class IMDBMovieData(object):
    @property
    def as_dict(self):
        return self._dict

    def __init__(self, **kwargs):
        self._dict = kwargs
        self.credits: dict = kwargs["credit_data"] or {}
        self.trivia: dict = kwargs["trivia_data"] or {}
        self.summary: dict = kwargs["summary_data"] or {}
        self.tagline: dict = kwargs["tagline_data"] or {}


def scrape_movie_data(idx: str) -> IMDBMovieData:
    raw_data = {
        "credit_data": scrape_credits(idx),
        "trivia_data": scrape_trivia(idx),
        "summary_data": scrape_summary(idx),
        "tagline_data": scrape_taglines(idx),
    }
    return IMDBMovieData(**raw_data)
