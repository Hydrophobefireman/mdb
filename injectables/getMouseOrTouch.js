const { minify } = require("terser");

/**
 *
 * @param {Window} win
 * @param {Document} doc
 */
const code = function (win, doc) {
  var TOUCH_EVENT = "touchstart";
  var MOUSE_EVENT = "mousedown";
  var body = doc.body;
  var html = doc.documentElement;
  function removeListeners() {
    body.removeEventListener(TOUCH_EVENT, hasTouchIntent);
    body.removeEventListener(MOUSE_EVENT, hasMouseIntent);
  }
  function hasTouchIntent() {
    html.removeAttribute("mouse-intent");
    html.setAttribute("touch-intent", "");
    removeListeners();
    win.__mdbApp.preferredInputIntent = "TOUCH";
  }
  function hasMouseIntent() {
    html.setAttribute("mouse-intent", "");
    removeListeners();
    win.__mdbApp.preferredInputIntent = "MOUSE";
  }
  body.addEventListener(TOUCH_EVENT, hasTouchIntent);
  body.addEventListener(MOUSE_EVENT, hasMouseIntent);
};
function create() {
  return minify(`(${code})(window,document)`).then((x) => x.code);
}

module.exports = { create };
