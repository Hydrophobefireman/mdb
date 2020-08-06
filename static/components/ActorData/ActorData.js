import { h, useEffect, useRef, useState, A } from "@hydrophobefireman/ui-lib";
import { cachedMovieData, getRequest } from "../../http/requests";
import {
  Object_keys as keys,
  Object_entries as entries,
} from "@hydrophobefireman/j-utils";

import OptimizedImage from "../OptimizedImage/OptimizedImage";
import { apiURL, deNodeify } from "../../utils/urlHandler";

export function ActorData({ data, back, params }) {
  return data
    ? h(PreLoadedDataRenderer, { data, back })
    : h(IdFetchRenderer, { params });
}
function IdFetchRenderer({ params }) {
  const actorId = params.actor_id;
  const [loading, setLoading] = useState(true);
  const [actorData, setData] = useState(null);
  useEffect(async () => {
    if (!actorId) return;
    setLoading(true);
    const resp = await getRequest(
      apiURL("/query/actors/id/search/", { q: actorId })
    );
    setLoading(false);
    const data = deNodeify((await resp.json()).data.actorDetails)[actorId];
    setData(data);
  }, [actorId]);
  if (!actorId) return null;
  if (loading) return h("loading-spinner");

  if (actorData)
    return h(
      "div",
      null,
      h(
        "div",
        { class: "poster-parent" },
        h(OptimizedImage, {
          class: "movie-poster hoverable movie-details-poster",
          src: actorData.thumbnail,
          useImgTag: true,
        })
      ),
      h($Renderer, { data: actorData })
    );
}
function PreLoadedDataRenderer({ data, back }) {
  return h(
    "div",
    {},
    h(
      "div",
      { style: "text-align:left" },
      h(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          height: "48",
          viewBox: "0 0 24 24",
          width: "48",
          class: "hoverable",
          onClick: back,
        },
        h("path", {
          d: "M0 0h24v24H0z",
          fill: "none",
        }),
        h("path", {
          d: "M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z",
        })
      )
    ),
    h($Renderer, { data })
  );
}
function $Renderer({ data }) {
  const $ref = useRef();
  const { name, movies } = data;
  const [movieList, setList] = useState(null);
  useEffect(() => {
    /** @type {HTMLElement} */
    const current = $ref.current;

    current && current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [data, movieList]);
  useEffect(async () => {
    if (!movies) return setList(null);
    const movieData = await cachedMovieData(movies);
    setList(movieData);
  }, [movies]);
  if (movieList && !keys(movieList).length) {
    return "No data available";
  }
  return movieList
    ? h(
        "div",
        { class: "anim-scale", ref: $ref },
        h("div", { class: "heading" }, name),
        h("div", { style: { fontWeight: "bold" } }, "Appears in - "),
        h(
          "div",
          { class: "info-header" },
          entries(movieList).map(([id, data], i) =>
            h(
              A,
              {
                href: `/title/${id}`,
                class: "movie-reel-item",
                "data-id": id,
                "no-animate": true,
                style: { animationDelay: `${0.08 * i}s` },
              },
              h(OptimizedImage, {
                src: data.movie_thumb,
                height: 200,
                width: 150,
              }),
              h("span", { class: "movie-reel-item-text" }, data.movie_title)
            )
          )
        )
      )
    : h("loading-spinner");
}

export default ActorData;
