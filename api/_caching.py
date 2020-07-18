from json import loads, dumps
from os.path import isfile, isdir, join
from os import mkdir, getcwd, remove
from functools import wraps
from time import time

caching_options = {
    "enable_caching": True,
    "directory": join(getcwd(), "@cache"),
    "get_file_name": lambda x: f"{x}.cache.json",
    "expire_if_older_than_seconds": 86400,
}


def safe_mkdir(d):
    isdir(d) or mkdir(d)


def lock_path(file_path: str) -> str:
    return join(f"{file_path}~~#lock")


def create_lock(file_path: str) -> None:
    open(lock_path(file_path), "w").close()


def close_lock(file_path: str) -> bool:
    remove(lock_path(file_path))


def is_unlocked(file_path: str) -> bool:
    return not isfile(lock_path(file_path))


def open_and_read(file_path: str) -> dict:
    if isfile(file_path) and is_unlocked(file_path):
        create_lock(file_path)
        with open(file_path) as f:
            dx = f.read().strip()
            close_lock(file_path)
            return loads(dx) if dx else remove(file_path)
    else:
        return None


def open_and_write(file_path: str, data: dict):
    if not is_unlocked(file_path):
        return
    create_lock(file_path)
    with open(file_path, "w") as f:
        f.write(dumps(data))
    close_lock(file_path)


def get_cache(key):
    if not caching_options["enable_caching"]:
        return None
    fn = caching_options["get_file_name"](key)
    path = join(caching_options["directory"], fn)
    data = open_and_read(path)
    if data is None:
        return None
    ret = data["data"]
    ts = data["time_stamp"]
    if time() - ts > caching_options["expire_if_older_than_seconds"]:
        return None
    return ret


def cache_json(key, data):
    dir_ = caching_options["directory"]
    fn = caching_options["get_file_name"](key)
    safe_mkdir(dir_)
    path = join(dir_, fn)
    js = {"time_stamp": time(), "data": data}
    open_and_write(path, js)


IDENTITY_CACHE = lambda *x: x[0] if x else None


def cache(key_method):
    def _cache(func):
        @wraps(func)
        def json_cache(*args, **kwargs):
            key = key_method(*args)
            has_cache = get_cache(key)
            if has_cache:
                return has_cache
            result = func(*args, **kwargs)
            cache_json(key, result)
            return result

        return json_cache

    return _cache
