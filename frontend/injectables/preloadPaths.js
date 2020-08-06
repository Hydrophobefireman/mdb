const { minify } = require("terser");

const code = function () {
  var paths = window.__mdbApp.preloadPaths;
  var host = location.host.includes("localhost")
    ? "http://localhost:5000"
    : "https://mdpy.herokuapp.com";
  window.__mdbApp.config["app.apiHost"] = host;
  for (key in paths) {
    var _ = paths[key];
    var path = _.path;
    var type = _.type;
    var crossorigin = _.crossorigin;
    var url = new URL(path, host);
    var href = url.href;
    var link = document.createElement("link");
    link.type = type;
    link.setAttribute("crossorigin", crossorigin ? "use-credentials" : "");
    link.rel = "preload";
    link.as = "fetch";
    link.href = href;
    document.head.appendChild(link);
  }
};
function create() {
  return minify(`(${code})()`).then((x) => x.code);
}
module.exports = { create };
