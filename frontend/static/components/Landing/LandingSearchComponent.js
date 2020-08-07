import { h, useState, useCallback, useRef } from "@hydrophobefireman/ui-lib";
import RealTimeResponseThumbnailComponent from "../RealTimeResponseComponent/RealTimeResponseComponent";
import { useMount } from "../../utils/hooks";
export default function LandingSearchComponent({ toggle }) {
  const [value, setValue] = useState("");
  const [search, setSearch] = useState(false);
  const handleInput = useCallback((e) => setValue(e.target.value || ""), []);
  const handleFormSubmit = useCallback(() => {
    if (!value) return;
    setSearch(true);
  }, [value]);
  const inputRef = useRef();
  useMount(() => inputRef.current && inputRef.current.focus(), []);
  return h(
    "div",
    { class: "landing-search-box" },
    h(
      "div",
      { class: "landing-search-header" },
      h(
        "div",
        { class: "close-search-component", onClick: toggle },
        h(
          "svg",
          {
            height: "24",
            viewBox: "0 0 24 24",
            width: "24",
          },
          h("path", {
            d: "M0 0h24v24H0V0z",
            fill: "none",
          }),
          h("path", {
            d:
              "M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z",
          })
        )
      )
    ),
    h(
      "form",
      { action: "javascript:", onSubmit: handleFormSubmit },
      h("input", {
        ref: inputRef,
        id: "__landing_input",
        value: value,
        class: "search-box-animated",
        onInput: handleInput,
        spellcheck: false,
        autoComplete: "off",
        placeholder: "Search..",
      })
    ),
    h(RealTimeResponseThumbnailComponent, {
      query: value.trim(),
      search,
      setSearch,
    })
  );
}
