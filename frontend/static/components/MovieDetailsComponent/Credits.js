import { h, useState, useEffect, useCallback } from "@hydrophobefireman/ui-lib";
import {
  Object_keys as keys,
  Object_entries as entries,
} from "@hydrophobefireman/j-utils";
import { getRequest } from "../../http/requests";
import { apiURL, deNodeify } from "../../utils/urlHandler";
import OptimizedImage from "../OptimizedImage/OptimizedImage";
import { ActorData } from "../ActorData/ActorData";

export function Credits({ credits }) {
  const [castData, setCastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cast = credits.cast;
  const [showCastInfo, setShow] = useState(null);
  useEffect(() => {
    setShow(null);
  }, [credits]);
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
  const handleClick = useCallback((e) => {
    e.preventDefault();
    const js = deNodeify(JSON.parse(e.target.dataset.js));
    setShow(js);
  }, []);
  const back = useCallback(() => setShow(null));
  if (showCastInfo) return h(ActorData, { data: showCastInfo, back });
  return loading
    ? h("loading-spinner")
    : h(
        "div",
        null,
        h(
          "div",
          {
            style: {
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
            },
          },
          castData &&
            entries(castData).map(([id, data], i) => {
              return h(
                "a",
                {
                  href: `/actor/${id}`,
                  class: "movie-reel-item prevent-child-click-events",
                  "data-js": JSON.stringify(data),
                  style: { animationDelay: `${0.08 * i}s` },
                  onClick: handleClick,
                },
                h(
                  "div",
                  { style: { height: `${200}px`, width: `${150}px` } },
                  h(OptimizedImage, {
                    useImgTag: true,
                    src: data.thumbnail,
                    height: 200,
                    width: 150,
                  })
                ),
                h(
                  "span",
                  { class: "movie-reel-item-text" },
                  data.name,
                  " - (",
                  data.character,
                  ")"
                )
              );
            })
        )
      );
}
