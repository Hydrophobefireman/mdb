import { h, A } from "@hydrophobefireman/ui-lib";
import OptimizedImage from "../OptimizedImage/OptimizedImage";

export default function MovieReel(props) {
  const { recs, reelData, cancelAnimations } = props;
  const data = reelData || recs.data.landingData.map((x) => x.__node);
  return data.map((x, i) =>
    h(ReelItem, {
      name: x.movie_title || x.name,
      img: x.thumb || x.movie_thumb,
      movie_id: x.movie_id,
      actor_id: x.actor_id,
      index: i,
      cancelAnimations,
    })
  );
}

function ReelItem(props) {
  return h(
    A,
    {
      href: props.movie_id
        ? `/title/${props.movie_id}`
        : `/actor/${props.actor_id}`,
      class: "movie-reel-item",
      "data-id": props.id,
      "no-animate": !!props.cancelAnimations,
      style: { animationDelay: `${0.08 * props.index}s` },
    },
    h(OptimizedImage, {
      src: props.img,
      height: 200,
      width: 150,
    }),
    h("span", { class: "movie-reel-item-text" }, props.name)
  );
}
