import {
  Component,
  h,
  Fragment,
  loadURL,
  Router,
  RouterSubscription,
} from "@hydrophobefireman/ui-lib";
import {
  percentageToPX,
  translateY,
  rotate,
  addToPX,
} from "../../utils/styles";
import { getRequest, defaultCacheConfig } from "../../http/requests";
import { apiURL } from "../../utils/urlHandler";
import MovieReel from "../MovieReel/MovieReel";
import LandingSearchComponent from "./LandingSearchComponent";
const mdbApp = window.__mdbApp;

export default class LandingComponent extends Component {
  state = { searchComponent: false, reelData: null, movieRecs: null };

  _onResize = () =>
    this.setState({ translateHeight: percentageToPX("height", 15) });

  toggleSearchComponent = () => {
    this.setState((ps) => {
      const searchComponent = !ps.searchComponent;
      searchComponent ? loadURL("/search") : loadURL("/");
      return { searchComponent };
    });
  };

  componentWillUnmount() {
    removeEventListener("resize", this._onResize);
    RouterSubscription.unsubscribe(this._sub);
  }

  _sub = () => this.setState({ searchComponent: Router.path === "/search" });

  componentDidMount() {
    if (Router.path === "/search") {
      this.toggleSearchComponent();
    }
    this._onResize();
    addEventListener("resize", this._onResize);

    RouterSubscription.subscribe(this._sub);

    const preloadPaths = mdbApp.preloadPaths;
    const movieRecs = getRequest(
      apiURL(preloadPaths.landingMovies.path),
      null,
      null,
      defaultCacheConfig
    );
    movieRecs
      .then((x) => x.json())
      .then((x) => this.setState({ movieRecs: x }));
  }
  componentDidCatch(e) {}
  render(props, state) {
    const hasTranslateHeight = "translateHeight" in state;
    const enableSearchComponent = state.searchComponent;
    const shouldShowOnLandingPage =
      hasTranslateHeight && !enableSearchComponent;
    if (enableSearchComponent)
      return h(LandingSearchComponent, { toggle: this.toggleSearchComponent });
    return h(
      Fragment,
      null,
      h(
        "div",
        { class: "reel-change" },
        h(FancyText, { text: "MDB - Movies & Posters", fancyCharacter: "&" }),
        shouldShowOnLandingPage &&
          h(
            "div",
            {
              tabindex: 1,
              onClick: this.toggleSearchComponent,
              style: { transform: translateY(state.translateHeight) },
              class: "landing-input-box",
            },
            "Search Movies, Actors"
          )
      ),
      shouldShowOnLandingPage && [
        h(
          "div",
          {
            style: { marginTop: addToPX(state.translateHeight, 40) },
            class: "info-header",
          },
          state.movieRecs
            ? h(MovieReel, { recs: state.movieRecs })
            : h("loading-spinner")
        ),
      ]
    );
  }
}

const FancyText = (() => {
  const getText = (txt) => h("span", null, txt);
  const getTilted = (txt, tiltValue) =>
    h(
      "span",
      {
        style: { transform: rotate(tiltValue), display: "inline-block" },
      },
      txt
    );
  return (props) => {
    const { text, fancyCharacter: fc, tiltValue = -30 } = props;
    const children = [];
    const curr = [];
    for (const i of text) {
      if (i !== fc) {
        curr.push(i);
      } else {
        children.push(getText(curr.join("")));
        children.push(getTilted(i, tiltValue));
        curr.length = 0;
      }
    }
    if (curr.length) children.push(getText(curr.join("")));
    return h("div", { class: "fancy-text" }, children);
  };
})();
