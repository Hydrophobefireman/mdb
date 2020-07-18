const docEl = document.documentElement;
const propMap = { height: "clientHeight", width: "clientWidth" };
const cache = {
  clientHeight: docEl.clientHeight,
  clientWidth: docEl.clientWidth
};
addEventListener("resize", _ => {
  cache.clientWidth = docEl.clientWidth;
  cache.clientHeight = docEl.clientHeight;
});
export const percentageToPX = (property, percentageValue) => {
  const prop = propMap[property] || property;
  const value = ((cache[prop] * percentageValue) / 100).toFixed(2);
  return `${value}px`;
};


export const addToPX = (px, add) => `${+px.replace("px", "")+add}px`;
export const translateX = x => `translateX(${x})`;
export const translateY = y => `translateY(${y})`;
export const translate = (x, y) => `translate(${x},${y})`;
export const rotate = x => `rotate(${x}deg)`;
