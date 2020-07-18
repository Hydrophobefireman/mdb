import { createRoutePath } from "@hydrophobefireman/ui-lib";
import FakeMap from "@hydrophobefireman/j-utils/@build-modern/src/modules/es6/loose/Map/index.js";
const componentMap = new FakeMap();

function addRoute(matchRegexp, componentPromise) {
  componentMap.set(matchRegexp, componentPromise);
}
const getDefault = (_module) => _module.default;

const landing = () =>
  import("./components/Landing/LandingComponent.js").then(getDefault);

addRoute(createRoutePath("/"), landing);
addRoute(createRoutePath("/search"), landing);
addRoute(createRoutePath("/title/:movie"), () =>
  import("./components/MovieDetailsComponent/MovieDetailsComponent").then(
    getDefault
  )
);

export default componentMap;
