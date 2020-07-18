import assign from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/assign";
import retry from "@hydrophobefireman/j-utils/@build-modern/src/modules/retry/index";
import { getKeyStore } from "../utils/respCache";

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
  const func = retry(fetch, 3, 100);
  const resp = await func(req);
  if (cache) {
    const { shouldCache, cacheTime } = cache;
    if (shouldCache) {
      cacheInBackground(await resp.clone(), url, cacheTime);
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
