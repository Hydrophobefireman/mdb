import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
import FakeSet from "@hydrophobefireman/j-utils/@build-modern/src/modules/es6/loose/Set/index";
export const defaultImg =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2NgYGD4DwABBAEAcCBlCwAAAABJRU5ErkJggg==";
const preloadedSet = new FakeSet();

export default class CloudinaryImage {
  /**
   *
   * @param {string} url
   */
  _paramMap = { quality: "q", height: "h", width: "w" };

  constructor(url) {
    if (!url) return;
    this._init(url);
  }
  /**
   *
   * @param {string} url
   */
  _init(url) {
    this._parseURL(url);
    this.set("q", "auto", true);
  }
  /**
   *
   * @param {string} param ex: height,width,q
   * @param {string|number} value
   * @param {boolean} _overwrite
   * @returns {CloudinaryImage}
   */
  set(param, value, _overwrite) {
    if (!this._configs) return this;
    param = this._paramMap[param] || param;
    if (_overwrite) this._configs = {};
    if (value == null) {
      delete this._configs[param];
    } else this._configs[param] = value;
    return this;
  }
  /**
   * @returns {string}
   */
  get() {
    if (!this._static || !this._fileName || !this._configs) return defaultImg;
    const mid = entries(this._configs)
      .map(([x, y]) => `${x}_${y}`)
      .join(",");

    return [this._static, mid, this._fileName].join("/");
  }
  // /**
  //  *
  //  * @param {string} src
  //  * @returns {Promise<boolean>}
  //  */
  // _preloadUsingLinkPreloadStrategy(href) {
  //   if (preloadedSet.has(href)) {
  //     return Promise.resolve(true);
  //   }
  //   /**
  //    * @type {HTMLLinkElement}
  //    */
  //   const link = Object.assign(document.createElement("link"), {
  //     rel: "preload",
  //     // crossOrigin: "use-credentials",
  //     href,
  //     as: "fetch",
  //   });
  //   preloadedSet.add(href);
  //   return new Promise((resolve) => {
  //     link.addEventListener("load", () => resolve(true), optionsListenOnce);
  //     link.addEventListener("error", () => resolve(false), optionsListenOnce);
  //     document.head.appendChild(link);
  //   });
  // }
  /**
   *
   * @param {string} src
   * @returns {Promise<boolean>}
   */
  _preloadUsingImageSrcStrategy(src) {
    if (preloadedSet.has(src)) return Promise.resolve(true);
    const i = new Image();

    return new Promise((resolve) => {
      const listener = () => {
        preloadedSet.add(src);
        resolve(true);
      };
      i.addEventListener("load", listener, { once: true });
      i.addEventListener("error", listener, { once: true });
      i.src = src;
    });
  }

  /**
   *
   * @param {string} src src of image to load
   * @returns {Promise<boolean>}
   */
  preloadImage(src) {
    src = src || this.get();
    if (!src) return Promise.resolve(true);
    return this._preloadUsingImageSrcStrategy(src);
  }
  /**
   *
   * @param {string} ext
   */
  setExtension(ext) {
    const last = this._fileName.split(".");
    this._fileName = `${last[0]}.${ext[0] === "." ? ext.substr(1) : ext}`;
    return this;
  }
  /**
   * @returns {void}
   * @param {string} url
   */
  _parseURL(url) {
    try {
      const x = new URL(url);
      const paths = x.pathname.split("/");
      const pathLength = paths.length;
      const fileName = paths[pathLength - 1];
      const staticData = paths.slice(0, pathLength - 2).join("/");
      const configs = {};
      this._static = x.protocol + "//" + x.host + staticData;
      this._fileName = fileName;
      this._configs = configs;
    } catch (e) {
      console.log(e, url);
    }
  }
}
