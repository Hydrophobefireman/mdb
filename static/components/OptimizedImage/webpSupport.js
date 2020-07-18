/**
 * @type {AddEventListenerOptions}
 */
export const optionsListenOnce = { once: true };

/**
 * @type {Promise<boolean>}
 */
const _supportsWebp = (() => {
  /**
   * @type {string} 1x1 webp image
   */
  const WEBP_TEST_IMG =
    "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAD8D+JaQAA3AA/ua1AAA=";
  const promise = new Promise(resolve => {
    const i = new Image();
    i.addEventListener(
      "load",
      () => resolve(i.naturalHeight === 1 && i.naturalWidth === 1),
      optionsListenOnce
    );
    i.addEventListener("error", () => resolve(false), optionsListenOnce);
    i.src = WEBP_TEST_IMG;
  });
  return promise;
})();
/**
 * @returns {Promise<boolean>}
 */
export default function supportsWebp() {
  return Promise.resolve(_supportsWebp);
}
