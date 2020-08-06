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
  const controller = useRef(null);
  useEffect(() => {
    if (!query || (!query.trim() && reelData.length)) setReelData([]);
  }, [query, reelData]);
  const __getFetchingPromise = useCallback(
    debounce(250, (q) => {
      if (!q || !q.trim()) return setReelData([]);
      const c = new AbortController();
      const signal = c.signal;
      controller.current = c;
      let rData = [];
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
      Promise.all([
        movieRequest
          .then((resp) => resp.json())
          .then((data) => {
            rData = rData.concat(parseData(data));
            query === q && setReelData(rData);
          }),
        actorRequest
          .then((resp) => resp.json())
          .then((data) => {
            rData = rData.concat(parseData(data));
            query === q && setReelData(rData);
          }),
      ])
        .then(() => (controller.current = null))
        .catch(() => (controller.current = null));
    }),
    [reelData, query]
  );

  useEffect(() => {
    const current = controller.current;
    const abort = () => current && current.abort();
    setReelData([]);
    abort();
    __getFetchingPromise(query);
  }, [query]);

  useEffect(() => {
    const c = new AbortController();
    (async () => {
      if (props.imdbSearch) {
        try {
          const resp = await getRequest(
            apiURL("/query/movies/search/_/imdb/", { q: query }),
            null,
            { signal: c.signal }
          );
          const respJson = await resp.json();
          props.setImdb(false);
          const data = deNodeify(respJson.data).IMDBSearchResults;
          const imdbData = data.map((x) => {
            return {
              name: x.title,
              thumb: x.thumbnail.template_height.replace("{{height}}", "200"),
              movie_id: x._imdb_details.id,
            };
          });

          setReelData((rd) => rd.concat(imdbData));
        } catch (e) {
          props.setImdb(false);
          console.log(e);
        }
      }
    })();
    return () => c.abort();
  }, [props.imdbSearch, query]);

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
      : null
  );
}
