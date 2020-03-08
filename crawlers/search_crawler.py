from constants import PROTO, HOST, API_ROUTE
from urllib.parse import urlencode, urljoin, urlparse
from util import image_url_parser, get_page, sanitize_str, get_id
from typing import List


def get_url(find: str) -> str:
    qs = urlencode({"s": "tt", "ttype": "ft", "q": find})
    return f"{PROTO}{HOST}{API_ROUTE}?{qs}"


def _get_imdb_data(href: str) -> dict:
    url = urljoin(PROTO + HOST, href)
    idx = get_id(url)
    parsed = urlparse(url)
    path, scheme, netloc = parsed.path, parsed.scheme, parsed.netloc
    full = f"{scheme}://{netloc}{path}"
    return {"full_url": full, "id": idx}


class IMDBSearchResult(object):
    @property
    def as_dict(self):
        return self._dict

    def __init__(self, **kwargs):
        known_kwargs = ["title", "_imdb_details", "thumbnail"]
        self._dict = kwargs
        if any(k not in kwargs for k in known_kwargs):
            raise Exception("Invalid Data")
        st = kwargs["searchable_title"] = sanitize_str(kwargs["title"])
        imdb = self._imdb_data = kwargs["_imdb_details"]
        thumb = self._thumbnail = kwargs["thumbnail"]
        self.title = kwargs["title"]
        self.searchable_title = st

        self.imdb_url = imdb["full_url"]
        self.movie_id = imdb["id"]
        self.thumbnail = thumb["full"]
        self.thumb_template = thumb["template_height"]


def scrape_search(title: str) -> List[IMDBSearchResult]:
    url = get_url(title)
    soup = get_page(url)
    results = soup.find("table").find_all("tr")
    data = [
        IMDBSearchResult(
            title=result.text.strip(),
            _imdb_details=_get_imdb_data(result.find("a").attrs.get("href")),
            thumbnail=image_url_parser(result.find("img").attrs.get("src")),
        )
        for result in results
    ]
    return data

