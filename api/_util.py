from re import sub as _sub
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup as Soup

try:
    from ._constants import BASIC_HEADERS, HOST, PROTO
except ImportError:
    from _constants import BASIC_HEADERS, HOST, PROTO


def check_html5lib():
    try:
        import html5lib

        del html5lib
    except ImportError:
        return False


lib = "html5lib" if check_html5lib() else "html.parser"


def id_to_url(idx: str) -> str:
    return urljoin(urljoin(f"{PROTO}{HOST}", "/title/"), idx) + "/"


def get_id(url: str) -> str:
    path = urlparse(url).path
    idx = list(filter(bool, path.split("/")))[-1]
    return idx


def remove_falsey_values(iterable) -> list:
    return list(filter(bool, iterable))


def image_url_parser(img: str) -> dict:
    # example of a clean URL -> https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@
    full_hd_url = img.split("._V1")[0]
    # full_hd_url = "".join(map(lambda x: x + "@", _full_hd_url))
    _height = full_hd_url + "._V1_SY{{height}}.jpg"
    return {"full": full_hd_url, "template_height": _height}


sanitize_str = lambda movie: _sub(r"([^\w]|_)", "", movie).strip().lower()


def get_page(url: str) -> Soup:
    print("[debug] Requesting:", url)
    page = requests.get(url, headers=BASIC_HEADERS)
    page.raise_for_status()
    return Soup(page.text, lib)


def next_table(el):
    return el.find_next("table") if el else None


def resp_template(r_type, dct: dict) -> dict:
    return {"data": {r_type: dct}}


def array_to_nodes(arr: list, as_iter=False) -> dict:
    _iter = map(lambda x: {"__node": x}, arr)
    return _iter if as_iter else list(_iter)


def de_nodify(arr: list, as_iter=False) -> list:
    _iter = map(lambda x: x["__node"], arr)
    return _iter if as_iter else list(_iter)
