import Component, { h, Router } from "@hydrophobefireman/ui-lib";
import { getKeyStore } from "../../utils/respCache";
import { getRequest } from "../../http/requests";
import { apiURL, deNodeify } from "../../utils/urlHandler";
import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";

const store = getKeyStore("movie-data-store");

export default class MovieDetails extends Component {
  async _saveDataToIndexedDB(data) {
    for (const [k, v] of entries(data)) {
      const currData = await store.get(k);
      if (currData) continue;
      store.set(k, v);
    }
  }
  _fetchMovieDataIfNeeded = async (q) => {
    // if (!q) return;
    if (Array.isArray(q)) {
      return await Promise.all(q.map(this._fetchMovieDataIfNeeded));
    } else {
      let data;
      const check = await store.get(q);
      if (check) {
        data = check;
      } else {
        const req = await getRequest(apiURL("/query/movies/id/search/", { q }));
        data = deNodeify((await req.json()).data.movieDetails);
        this._saveDataToIndexedDB(data);
      }
      return data;
    }
  };
  fetchDataForTitle(t) {
    if (!t) return;
    this._fetchMovieDataIfNeeded(t).then((data) => this.setState({ data }));
  }
  getCurrentTitle() {
    return Router.getCurrentParams("/title/:movie").movie;
  }
  init() {
    const title = this.getCurrentTitle();
    this.setState({ title });
    this.fetchDataForTitle(title);
  }
  componentDidMount() {
    this.init();
  }
  componentDidUpdate() {
    if (this.state.title !== this.getCurrentTitle()) {
      this.init();
    }
  }

  render(props, state) {
    console.log(state);
    return this.state.title;
  }
}

