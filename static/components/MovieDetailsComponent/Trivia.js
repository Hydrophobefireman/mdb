import { h } from "@hydrophobefireman/ui-lib";
export function Trivia({ trivia }) {
  return h(
    "div",
    { class: "data-list" },
    h("div", { class: "heading" }, "Trivia"),
    h(
      "div",
      { class: "trivia-pieces" },
      trivia.map((x) => h("div", { class: "triv-piece" }, x))
    )
  );
}
