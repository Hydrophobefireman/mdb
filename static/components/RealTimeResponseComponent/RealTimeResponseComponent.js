import Component, { h } from "@hydrophobefireman/ui-lib";
import { getRequest } from "../../http/requests";
import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
import { apiURL } from "../../utils/urlHandler";
import MovieReel from "../MovieReel/MovieReel";
import { debounce } from "../../utils/debounce";

const _normalize = (str) => (str || "").trim().toLowerCase();
export default class RealTimeResponseThumbnailComponent extends Component {
  constructor(props) {
    super(props);
    /**
     * @type {{pendingResponse:Promise<Response>|null,controller:AbortController|null}}
     */
    this.state = {
      pendingResponse: null,
      controller: null,
      receivedData: null,
    };
  }
  parseData(data) {
    const obj = data.data.movieSearchResults;
    const receivedData = [];
    entries(obj).forEach(([k, v]) => {
      v.movie_id = k;
      receivedData.push(v);
    });
    return receivedData;
  }
  __getFetchingPromise = debounce(250, (q) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const request = getRequest(
      apiURL("/query/movies/search/", { q, isAutoComplete: true }),
      null,
      {
        signal,
      }
      // DO NOT cache this
    );
    const newState = { controller, pendingResponse: request };
    request
      .then((resp) => resp.json())
      .then((data) => {
        this.setState({
          pendingResponse: null,
          controller: null,
          receivedData: this.parseData(data),
        });
      });
    this.setState(newState);
  });

  componentDidUpdate = (oldProps, oldState) => {
    let { query } = this.props;
    let { query: oldQuery } = oldProps || {};
    query = _normalize(query);
    oldQuery = _normalize(oldQuery);
    if (!query) {
      if (this.state.receivedData && this.state.receivedData.length) {
        this.setState({ receivedData: [] });
      }
      return;
    }
    if (query === oldQuery) {
      if (this.state.pendingResponse == null && !this.state.receivedData) {
        this.__getFetchingPromise(query);
      }
    } else {
      if (this.state.pendingResponse != null) {
        this.state.controller.abort();
      }
      // this.setState({ receivedData: [] });
      this.__getFetchingPromise(query);
    }
  };
  // componentDidMount = this.componentDidUpdate;
  render() {
    const data = this.state.receivedData;
    const dLen = data && data.length;
    return h(
      "div",
      { "data-js": dLen, class: "info-header" },
      dLen ? h(MovieReel, { reelData: data, cancelAnimations: true }) : null
    );
  }
}

export class RealTimeResponseTextComponent extends RealTimeResponseThumbnailComponent {
  render() {
    const data = this.state.receivedData;
    const dLen = data && data.length;
    return h(
      "div",
      { "data-js": dLen, class: "info-header" },
      dLen ? h("div", { reelData: data, cancelAnimations: true }) : null
    );
  }
}
