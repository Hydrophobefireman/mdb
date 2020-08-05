import { h, useState, useEffect, A } from "@hydrophobefireman/ui-lib";
import {
  Object_keys as keys,
  Object_entries as entries,
} from "@hydrophobefireman/j-utils";
import { getRequest } from "../../http/requests";
import { apiURL } from "../../utils/urlHandler";
import OptimizedImage from "../OptimizedImage/OptimizedImage";

export function Credits({ credits }) {
  const [castData, setCastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cast = credits.cast;
  const director = credits.director;
  useEffect(async () => {
    const actorIDs = keys(cast);
    setLoading(true);
    const resp = await getRequest(
      apiURL("/query/actors/id/search/", { q: actorIDs.join("!") })
    );
    setLoading(false);
    const data = (await resp.json()).data.actorDetails;
    const cData = {};
    actorIDs.forEach((id) => {
      cData[id] = { character: cast[id], ...data[id] };
    });
    setCastData(cData);
  }, [credits]);
  return loading
    ? h("loading-spinner")
    : h(
        "div",
        null,
        h("div", null, "Directed by - ", director),
        h(
          "div",
          { style: { display: "flex", flexWrap: "wrap" } },
          castData &&
            entries(castData).map(([id, data], i) => {
              return h(
                A,
                {
                  href: `/actor/${id}`,
                  class: "movie-reel-item",
                  "data-id": id,
                  style: { animationDelay: `${0.08 * i}s` },
                },
                h(
                  "div",
                  { style: { height: 200, width: 150 } },
                  h(OptimizedImage, {
                    src: data.thumbnail,
                    height: 200,
                    width: 150,
                  })
                ),
                h("span", { class: "movie-reel-item-text" }, data.name)
              );
            })
        )
      );
}
