import { h, useEffect, useState } from "@hydrophobefireman/ui-lib";
import { getKeyStore } from "../../utils/respCache";
import { getRequest } from "../../http/requests";
import { apiURL, deNodeify } from "../../utils/urlHandler";
import { PosterBox } from "./PosterBox";
import { Taglines } from "./Taglines";
import { Summary } from "./Summary";
import { Trivia } from "./Trivia";
import { Credits } from "./Credits";
const store = getKeyStore("movie-data-store");

export default function MovieDetails(props) {
  const movieId = props.params.movie;
  const [data, setData] = useState(null);
  useEffect(async () => {
    const check = await store.get(movieId);
    if (check) return setData(check);
    const req = await getRequest(
      apiURL("/query/movies/id/search", { q: movieId })
    );
    const data = deNodeify((await req.json()).data.movieDetails);
    store.set(movieId, data);
    return setData(data);
  }, [movieId]);
  return data
    ? h(MovieDataRenderer, { data: data[movieId] })
    : h("loading-spinner");
}

function MovieDataRenderer({ data }) {
  const taglines = data.tagline;
  const summary = data.summary;
  const trivia = data.trivia;
  const credits = data.credits;
  return h(
    "div",
    { class: "movie-data" },
    h(PosterBox, { data }),
    h(Taglines, { taglines }),
    h(Credits, { credits }),
    h(Summary, { summary }),
    h(Trivia, { trivia })
  );
}
