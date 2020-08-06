export function debounce(time, fn) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(null, arguments), time || 400);
  };
}
