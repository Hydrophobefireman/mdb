import { h, useEffect, useState, useRef } from "@hydrophobefireman/ui-lib";
import { PosterBox } from "./PosterBox";
import { Taglines } from "./Taglines";
import { Summary } from "./Summary";
import { Trivia } from "./Trivia";
import { Credits } from "./Credits";
import { cachedMovieData } from "../../http/requests";

export default function MovieDetails(props) {
  const movieId = props.params.movie;
  const [data, setData] = useState(null);
  useEffect(async () => {
    return setData(await cachedMovieData(movieId));
  }, [movieId]);
  return data ? h(MovieDataRenderer, { data }) : h("loading-spinner");
}

function MovieDataRenderer({ data }) {
  const taglines = data.tagline;
  const summary = data.summary;
  const trivia = data.trivia;
  const credits = data.credits;
  const ref = useRef();
  useEffect(() => scroll({ top: 0, left: 0, behavior: "smooth" }), [data]);
  return h(
    "div",
    { class: "movie-data", ref },
    h(PosterBox, { data }),
    h(Taglines, { taglines }),
    h(Credits, { credits }),
    h(Summary, { summary }),
    h(Trivia, { trivia })
  );
}
