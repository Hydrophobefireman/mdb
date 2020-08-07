import {
  h,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "@hydrophobefireman/ui-lib";
import { getRequest } from "../../http/requests";
import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
import { apiURL, deNodeify } from "../../utils/urlHandler";
import MovieReel from "../MovieReel/MovieReel";
import { debounce } from "../../utils/debounce";
import FakeSet from "@hydrophobefireman/j-utils/@build-modern/src/modules/es6/loose/Set";

const _normalize = (str) => (str || "").trim().toLowerCase();
export function parseData(data) {
  const obj = data.data.movieSearchResults || data.data.actorSearchResults;
  const receivedData = [];
  entries(obj).forEach(([k, v]) => {
    const isActor = "name" in v;
    const ret = {
      name: v.name || v.movie_title,
      thumb: v.movie_thumb || v.thumbnail,
      [isActor ? "actor_id" : "movie_id"]: k,
    };
    receivedData.push(ret);
  });
  return receivedData;
}

export default function RealTimeResponseThumbnailComponent(props) {
  const query = _normalize(props.query);
  const [reelData, setReelData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const controller = useRef(null);
  useEffect(() => {
    if (!query || (!query.trim() && reelData.length)) setReelData([]);
  }, [query, reelData]);
  const __getFetchingPromise = useCallback(
    (q) => {
      if (!q || !q.trim() || !props.search) return setReelData([]);
      setLoading(true);
      props.setSearch(false);
      const c = new AbortController();
      const signal = c.signal;
      controller.current = c;
      let movies = [];
      let actors = [];
      let imdb = [];
      // DO NOT cache this
      const movieRequest = getRequest(
        apiURL("/query/movies/search/", { q }),
        null,
        { signal }
      );
      const actorRequest = getRequest(
        apiURL("/query/actors/search/", { q }),
        null,
        { signal }
      );
      const imdbResp = getRequest(
        apiURL("/query/movies/search/_/imdb/", { q: query }),
        null,
        { signal }
      );
      Promise.all([
        movieRequest
          .then((resp) => resp.json())
          .then((data) => {
            movies = parseData(data);
          }),
        actorRequest
          .then((resp) => resp.json())
          .then((data) => {
            actors = parseData(data);
          }),
        imdbResp
          .then((resp) => resp.json())
          .then((data) => {
            const js = deNodeify(data.data).IMDBSearchResults;
            imdb = js.map((x) => ({
              name: x.title,
              thumb: x.thumbnail.template_height.replace("{{height}}", "200"),
              movie_id: x._imdb_details.id,
            }));
          }),
      ])
        .then(() => {
          setReelData(movies.concat(actors, imdb));
          controller.current = null;
          setLoading(false);
        })
        .catch(() => {
          setReelData([]);
          controller.current = null;
          setLoading(false);
        });
    },
    [reelData, query, isLoading, props.search]
  );

  useEffect(() => {
    if (props.search) {
      const current = controller.current;
      const abort = () => current && current.abort();
      setReelData([]);
      abort();
      __getFetchingPromise(query);
    }
  }, [query, props.search]);

  const dLen = reelData && reelData.length;
  const common = new FakeSet();

  return h(
    "div",
    { "data-js": dLen, class: "info-header" },
    dLen
      ? h(MovieReel, {
          reelData: reelData.filter((x) => {
            const id = x.movie_id || x.actor_id;
            if (common.has(id)) return false;
            common.add(id);
            return true;
          }),
          cancelAnimations: true,
        })
      : isLoading && h("loading-spinner")
  );
}
