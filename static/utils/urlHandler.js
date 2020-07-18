import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
/**
 * @type {import("../../injectables/initialConfig.json")}
 */
const mdbApp = window.__mdbApp;
const host = mdbApp.config["app.apiHost"] || location.origin;

export function apiURL(url, params) {
  const u = new URL(url, host);
  if (params) {
    entries(params).forEach(([x, y]) => u.searchParams.set(x, y));
  }
  return u.href;
}

export function movieIDToURL(idx) {
  /**@NOTIMPLEMENTED */
}

const isObject = (x) => x && x.constructor === Object;
export function deNodeify(json) {
  if (isObject(json)) {
    const newObj = {};
    for (const [k, v] of entries(json)) {
      if (Array.isArray(v)) {
        newObj[k] = v.map((x) => x.__node);
      } else {
        newObj[k] = deNodeify(v);
      }
    }
    return newObj;
  } else {
    return json;
  }
}
