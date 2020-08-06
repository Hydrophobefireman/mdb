import assign from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/assign";
import { getKeyStore } from "../utils/respCache";
import { apiURL, deNodeify } from "../utils/urlHandler";
import { Object_entries as entries } from "@hydrophobefireman/j-utils";

export const defaultCacheConfig = { shouldCache: true, cacheTime: 86400 };

const customFetchCache = getKeyStore("fetch-cache");
const defaultHeaders = {};
const initDict = {};
/**
 *
 * @param {Response} clonedResponse
 * @param {string} url
 * @param {string} method
 */
function cacheInBackground(clonedResponse, url, time) {
  clonedResponse.blob().then((blob) =>
    customFetchCache.set(url, {
      response: blob,
      time,
      cachedTimeStamp: +new Date(),
    })
  );
}
/**
 *
 * @param {string} url
 * @returns {Promise<Response|void>}
 */
async function checkCache(url) {
  const resp = await customFetchCache.get(url);
  if (resp) {
    const { response, time, cachedTimeStamp } = resp;
    if (+new Date() - cachedTimeStamp >= time) {
      customFetchCache.del(url);
      return null;
    }
    console.log("[cache]Cached Response for URL:", url);
    return new Response(response);
  }
  return;
}
async function fetchRequest(url, headers, options = {}, method, cache) {
  if (method === "get") {
    const resp = await checkCache(url);
    if (resp) return resp;
  }
  const sendHeaders = assign({}, headers || {}, defaultHeaders);
  const sendOptions = assign({}, initDict, options);
  const req = new Request(url, {
    method: method,
    headers: sendHeaders,
    ...sendOptions,
  });
  const resp = await fetch(req);
  if (cache) {
    const { shouldCache, cacheTime } = cache;
    if (shouldCache) {
      cacheInBackground(resp.clone(), url, cacheTime);
    }
  }
  return resp;
}

/**
 * @returns {Promise<Response>}
 * @param {string} url
 * @param {{}} headers
 * @param {RequestInit} options
 */
export function getRequest(url, headers, options, cache) {
  return fetchRequest(url, headers, options, "get", cache);
}
export function postJSONRequest(url, data, headers) {
  const js = JSON.stringify(data);
  const options = { body: js };
  const hdr = Object.assign({}, headers);
  hdr["content-type"] = "application/json";
  return fetchRequest(url, headers, options, "post", false);
}

const _MovieStore = getKeyStore("movie-data-store");
export async function cachedMovieData(movieId, filter) {
  const url = "/query/movies/id/search";

  if (Array.isArray(movieId)) {
    const returnData = {};
    const unCached = [];
    for (const id of movieId) {
      let resp;
      if ((resp = await _MovieStore.get(id))) {
        returnData[id] = resp;
      } else {
        unCached.push(id);
      }
    }
    if (unCached.length) {
      const resp = await (
        await getRequest(
          apiURL(url, {
            q: unCached.join("!"),
            filter: !!filter,
          })
        )
      ).json();
      const ret = deNodeify(resp.data.movieDetails);
      entries(ret).forEach(([id, data]) => {
        returnData[id] = data;
        _MovieStore.set(id, data);
      });
    }
    return returnData;
  }

  const check = await _MovieStore.get(movieId);
  if (check) return check;
  const req = await getRequest(apiURL(url, { q: movieId, filter: !!filter }));
  const data = deNodeify((await req.json()).data.movieDetails)[movieId];
  preventExcessiveData(_MovieStore.set(movieId, data));
  return data;
}

async function preventExcessiveData(prom) {
  await prom;
  const keys = await _MovieStore.keys();
  keys && keys.length > 500 && _MovieStore.__clear__();
}
