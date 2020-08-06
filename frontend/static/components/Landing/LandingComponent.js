import {
  Fragment,
  Router,
  RouterSubscription,
  h,
  loadURL,
  useCallback,
  useState,
} from "@hydrophobefireman/ui-lib";
import { addToPX, percentageToPX, translateY } from "../../utils/styles";
import { defaultCacheConfig, getRequest } from "../../http/requests";
import { FancyText } from "../shared/FancyText";

import LandingSearchComponent from "./LandingSearchComponent";
import MovieReel from "../MovieReel/MovieReel";
import { apiURL } from "../../utils/urlHandler";
import { useMount } from "../../utils/hooks";
import { parseData } from "../RealTimeResponseComponent/RealTimeResponseComponent";
const mdbApp = window.__mdbApp;

const getHeight = () => percentageToPX("height", 15);
const getSearch = () => Router.path === "/search";
export default function LandingComponent() {
  const [movieRecs, setMovieRecs] = useState(null);
  const [translateHeight, setTranslateHeight] = useState(getHeight);
  const [searchComponent, setSearchComponent] = useState(getSearch);

  const toggleSearchComponent = useCallback(() => {
    let s = !searchComponent;
    s ? loadURL("/search") : loadURL("/");
    setSearchComponent(s);
  });
  useMount(() => {
    const onResize = () => setTranslateHeight(getHeight);
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  });

  useMount(() => {
    const subscription = () => setSearchComponent(getSearch);
    RouterSubscription.subscribe(subscription);
    return () => RouterSubscription.unsubscribe(subscription);
  }, []);
  useMount(() => {
    const preloadPaths = mdbApp.preloadPaths;
    const movieRecs = getRequest(
      apiURL(preloadPaths.landingMovies.path),
      null,
      null,
      defaultCacheConfig
    );
    movieRecs.then((x) => x.json()).then((x) => setMovieRecs(x));
  });
  if (searchComponent) {
    return h(LandingSearchComponent, { toggle: toggleSearchComponent });
  }
  return h(
    Fragment,
    null,
    h(
      "div",
      { class: "reel-change" },
      h(FancyText, { text: "MDB - Movies & Posters", fancyCharacter: "&" }),

      h(
        "div",
        {
          tabindex: 1,
          onClick: toggleSearchComponent,
          style: { transform: translateY(translateHeight) },
          class: "landing-input-box",
        },
        "Search Movies, Actors"
      )
    ),
    h(
      "div",
      {
        style: { marginTop: addToPX(translateHeight, 40) },
        class: "info-header",
      },
      movieRecs ? h(MovieReel, { recs: movieRecs }) : h("loading-spinner")
    )
  );
}
