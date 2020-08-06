import { h, useState, useCallback, A } from "@hydrophobefireman/ui-lib";
import preferenceManager from "../../utils/emit";
import { useLocation, useMount } from "../../utils/hooks";

const pushToDOM = (val) =>
  document.documentElement.setAttribute("data-img-color", val);

export default function HeaderComponent() {
  const [thumbs, setThumbs] = useState(false);
  const loc = useLocation();
  const onThumbnailPrefChange = useCallback((newVal) => {
    pushToDOM(newVal);
    setThumbs(newVal);
    /*we only need to listen to the first change reflected by idb after that
      we are pretty much the only ones emitting the event anyway*/
    preferenceManager.removePrefListener(
      "showColouredThumbs",
      onThumbnailPrefChange
    );
  }, []);
  useMount(() =>
    preferenceManager.addPrefListener(
      "showColouredThumbs",
      onThumbnailPrefChange
    )
  );
  const emitThumbnailPref = useCallback((val) => {
    pushToDOM(val);
    preferenceManager.setPrefs("showColouredThumbs", val);
  }, []);
  const toggleColouredImageThumbnailPref = useCallback(() => {
    const newVal = !thumbs;
    emitThumbnailPref(newVal);
    setThumbs(newVal);
  }, [thumbs]);
  return h(
    "div",
    { class: "header-div" },
    loc !== "/" &&
      h(
        "div",
        {
          style: {
            margin: "auto",
            fontSize: "2.5rem",
            fontFamily: "Amatic SC",
            cursor: "pointer",
          },
          class: "hoverable",
        },
        h(A, { href: "/" }, "MDB")
      ),
    h(
      "span",
      {
        class: "toggle-img-grey-scale hoverable",
        tabindex: 1,
        title: `${thumbs ? "Enable" : "Disable"} greyscale thumbnails`,
        onClick: toggleColouredImageThumbnailPref,
      },
      h(
        "svg",
        {
          height: "24",
          viewBox: "0 0 24 24",
          width: "24",
        },
        h("path", {
          d: thumbs ? "M24 0H0v24h24V0z" : "M0 0h24v24H0V0z",
          fill: "none",
        }),
        h("path", {
          d: thumbs
            ? "M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76V5.1L7.76 9.35C6.62 10.48 6 11.99 6 13.59z"
            : "M6 13.59c0 1.6.62 3.1 1.76 4.24 1.13 1.14 2.64 1.76 4.24 1.76v-4.8L7.21 10C6.43 11.03 6 12.27 6 13.59z",
          opacity: ".3",
        }),
        h("path", {
          d: thumbs
            ? "M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"
            : "M12 5.1v4.05l7.4 7.4c1.15-2.88.59-6.28-1.75-8.61L12 2.27 8.56 5.71l1.41 1.41L12 5.1zm-7.6-.73L2.99 5.78l2.78 2.78c-2.54 3.14-2.35 7.75.57 10.68C7.9 20.8 9.95 21.58 12 21.58c1.78 0 3.56-.59 5.02-1.77l2.7 2.7 1.41-1.41L4.4 4.37zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59c0-1.32.43-2.56 1.21-3.59L12 14.79v4.8z",
        }),
        !thumbs &&
          h("path", {
            d: "M12 9.15V5.1L9.97 7.12z",
            opacity: ".3",
          })
      )
    )
  );
}
