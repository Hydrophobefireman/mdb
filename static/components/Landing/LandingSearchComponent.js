import Component, { h } from "@hydrophobefireman/ui-lib";
import RealTimeResponseThumbnailComponent from "../RealTimeResponseComponent/RealTimeResponseComponent";

export default class LandingSearchComponent extends Component {
  state = { value: "" };
  _handleFormSubmit = (e) => {
    console.log(e);
  };
  _handleInput = (e) => {
    this.setState({ value: e.target.value || "" });
  };
  componentDidMount() {
    const el = document.getElementById("__landing_input");
    el && el.focus();
  }
  render(props, state) {
    return h(
      "div",
      { class: "landing-search-box" },
      h(
        "div",
        { class: "landing-search-header" },
        h("div", { class: "close-search-component", onClick: props.toggle })
      ),
      h(
        "form",
        { action: "javascript:", onSubmit: this._handleFormSubmit },
        h("input", {
          id: "__landing_input",
          value: state.value,
          class: "search-box-animated",
          
          onInput: this._handleInput,
          spellcheck: false,
          autoComplete: "off",
          placeholder: "Search..",
        })
        // h("button", { class: "search-button hoverable" }, "Submit")
      ),
      h(RealTimeResponseThumbnailComponent, {
        query: (state.value || "").trim(),
      })
    );
  }
}
