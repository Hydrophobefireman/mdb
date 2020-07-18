import { h, Component, Fragment, Router, A } from "@hydrophobefireman/ui-lib";
const cssClassMap = { MOUSE: "click-menu", TOUCH: "touch-menu" };
const BODY_STYLE = document.body.style;
let preferredInputIntent;
let cssProp;

function initializeCssProp() {
  if (cssProp == null) {
    preferredInputIntent = window.__mdbApp.preferredInputIntent || "MOUSE";
    cssProp = cssClassMap[preferredInputIntent];
  }
}
export default class DynamicMenuComponent extends Component {
  componentWillUnmount() {
    BODY_STYLE.overflowY = "unset";
  }
  componentDidMount() {
    BODY_STYLE.overflowY = "hidden";
  }
  render(props) {
    initializeCssProp();
    return h(
      Fragment,
      null,
      h("div", { class: "mask", onClick: props.toggle }),
      h("div", { class: `menu-box ${cssProp}` }, h(MenuItems))
    );
  }
}
function MenuItems() {
  const path = Router.path;
  return h(
    Fragment,
    null,
    h("div", null, "(Device is ", h(OnlineOfflineText), ")")
  );
}

function OnlineOfflineText() {
  const onLine = navigator.onLine;
  const text = onLine ? "online" : "offline";
  const color = onLine ? "green" : "red";
  return h("span", { style: { color } }, text);
}
