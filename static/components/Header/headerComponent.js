import {
  h,
  Component,
  Router,
  RouterSubscription,
} from "@hydrophobefireman/ui-lib";
import DynamicMenuComponent from "./DynamicMenuComponent";
import preferenceManager from "../../utils/emit";
const pushToDOM = (val) =>
  document.documentElement.setAttribute("data-img-color", val);
class HeaderComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      path: Router.path,
      showColouredThumbs: false,
      showMenuComponent: false,
    };
  }
  _toggleMenu = () =>
    this.setState((ps) => ({ showMenuComponent: !ps.showMenuComponent }));
  _onRouteChange = () => this.setState({ path: Router.path });
  _onThumbnailPrefChange = (newVal) => {
    pushToDOM(newVal);

    this.setState({ showColouredThumbs: newVal });

    preferenceManager.removePrefListener(
      /*we only need to listen to the first change reflected by idb after that
      we are pretty much the only ones emitting the event anyway*/
      "showColouredThumbs",
      this._onThumbnailPrefChange
    );

    this._onThumbnailPrefChange = null;
  };
  componentDidMount() {
    RouterSubscription.subscribe(this._onRouteChange);
    preferenceManager.addPrefListener(
      "showColouredThumbs",
      this._onThumbnailPrefChange
    );
  }
  // componentWillUnmount() {

  //   RouterSubscription.unsubscribe(this._onRouteChange);
  // }
  _emitThumbnailPref(val) {
    pushToDOM(val);
    preferenceManager.setPrefs("showColouredThumbs", val);
  }
  _toggleColouredImageThumbnailPref = () =>
    this.setState((ps) => {
      const newVal = !ps.showColouredThumbs;
      this._emitThumbnailPref(newVal);
      return { showColouredThumbs: newVal };
    });

  render(props, state) {
    const { path, showMenuComponent } = state;
    return h(
      "div",
      { class: "header-div" },
      showMenuComponent &&
        h(DynamicMenuComponent, {
          toggle: this._toggleMenu,
          displayState: showMenuComponent,
        }),
      h("span", {
        class: `menu-img${showMenuComponent ? " hide" : ""}`,
        onClick: this._toggleMenu,
      }),
      h("span", {
        "data-color": `${state.showColouredThumbs}`,
        class: "toggle-img-grey-scale",
        tabindex: 1,
        title: `${
          state.showColouredThumbs ? "Enable" : "Disable"
        } greyscale thumbnails`,
        onClick: this._toggleColouredImageThumbnailPref,
      })
    );
  }
}

export default HeaderComponent;
