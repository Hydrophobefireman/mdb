import OptimizedImage from "../OptimizedImage/OptimizedImage";
import { h } from "@hydrophobefireman/ui-lib";

export function PosterBox({ data }) {
  const meta = data.meta || {};
  const genres = meta.genres || [];
  const releaseDate = meta.release_date;
  const time = meta.time;
  return h(
    "div",
    { class: "poster-box" },
    h(
      "div",
      { class: "poster-parent" },
      h(OptimizedImage, {
        class: "movie-poster hoverable",
        src: data.movie_thumb,
        useImgTag: true,
      })
    ),
    h(
      "div",
      { class: "movie-meta" },
      h("div", { class: "movie-title" }, data.movie_title),
      h(
        "div",
        { class: "movie-meta-item" },
        h(
          "span",
          null,
          h(
            "svg",
            {
              height: "24",
              width: "24",
              viewBox: "0 0 24 24",
            },
            h("path", {
              d: "M0 0h24v24H0z",
              fill: "none",
            }),
            h("path", {
              d:
                "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
            })
          )
        ),
        h("span", { class: "meta-text" }, releaseDate)
      ),
      h(
        "div",
        { class: "movie-meta-item" },
        h(
          "span",
          null,
          h(
            "svg",
            { height: "24", width: "24", viewBox: "0 0 24 24" },
            h("path", {
              d:
                "M21 5c-1.1-.3-2.3-.5-3.5-.5-2 0-4 .4-5.5 1.5-1.4-1.1-3.5-1.5-5.5-1.5S2.5 4.9 1 6v14.7c0 .2.3.4.5.4h.3C3 20.4 5 20 6.5 20c2 0 4 .4 5.5 1.5a12 12 0 015.5-1.5c1.6 0 3.4.3 4.8 1l.2.1c.3 0 .5-.3.5-.5V6c-.6-.5-1.3-.8-2-1zm0 13.5a11.6 11.6 0 00-9 1V8a11.6 11.6 0 019-1v11.5zm-3.5-8c.9 0 1.7 0 2.5.3V9.2a13.5 13.5 0 00-7 .6v1.7c1.1-.7 2.7-1 4.5-1zm-4.5 2v1.7c1.1-.7 2.7-1 4.5-1 .9 0 1.7 0 2.5.2V12a13.5 13.5 0 00-7 .6zm4.5 1.8c-1.7 0-3.2.3-4.5.9v1.6c1.1-.6 2.7-1 4.5-1 .9 0 1.7.1 2.5.3v-1.5a10 10 0 00-2.5-.3z",
            })
          )
        ),
        h(
          "span",
          { class: "meta-text" },
          genres.length ? genres.join(", ") : "N/A"
        )
      ),
      h(
        "div",
        { class: "movie-meta-item" },
        h(
          "span",
          null,
          h(
            "svg",
            {
              height: "24",
              width: "24",
              viewBox: "0 0 24 24",
            },
            h("path", {
              fill: "none",
              d: "M0 0h24v24H0z",
              opacity: ".1",
            }),
            h("path", {
              d:
                "M20 12a8 8 0 00-3-6.3L16 0H8L7 5.7a8 8 0 000 12.6L8 24h8l1-5.7a8 8 0 003-6.3zM6 12a6 6 0 1112 0 6 6 0 01-12 0z",
            })
          )
        ),

        h("span", { class: "meta-text" }, time)
      )
    )
  );
}
