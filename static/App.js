import {
  h,
  render,
  Router,
  Fragment,
  AsyncComponent,
  Path,
} from "@hydrophobefireman/ui-lib";
import componentMap from "./componentLoader";
import HeaderComponent from "./components/Header/headerComponent";
import { init } from "@hydrophobefireman/qwc/index.js";
import "./App.css";
import "./components/Landing/landingComponent.css";
import "./components/MovieReel/MovieReel.css";
import "./components/OptimizedImage/opt.css";
import "./components/Header/headerComponent.css";
import "./components/MovieDetailsComponent/MovieDetailsComponent.css";
const root = document.getElementById("app-root");
init({
  "loading-spinner": {
    observedAttributes: [
      {
        prop: "size",
        listener(_, nv) {
          const h = nv ? `${nv}${nv.includes("px") ? "" : "px"}` : "50px";
          const style = this.shadowRoot.querySelector(".spinner").style;
          style.height = style.width = h;
        },
      },
    ],
  },
});
const LoadingSpinner = () => h("loading-spinner", null, "Loading");

function NotFoundComponent() {
  return h("div", null, "The Requested URL was not found");
}
function AppLoader() {
  return h(
    Router,
    { fallbackComponent: NotFoundComponent },
    Array.from(componentMap.entries()).map(([x, y]) =>
      h(Path, {
        match: x,
        component: (props) =>
          h(AsyncComponent, {
            componentPromise: () => y().then((c) => h(c, props)),
            fallbackComponent: LoadingSpinner,
          }),
      })
    )
  );
}
const App = () =>
  h(
    Fragment,
    null,
    h(HeaderComponent, {}),
    h("div", { class: "app-shell" }, h(AppLoader))
  );

render(h(App), root);
root.removeAttribute("unrendered");
