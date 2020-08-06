import { useState, h, useCallback } from "@hydrophobefireman/ui-lib";

export function Summary({ summary }) {
  return h(
    "div",
    { class: "data-list" },
    h("div", { class: "heading" }, "Summaries"),
    h(
      "div",
      null,
      summary.map((x) => h(SummaryEntry, { x }))
    )
  );
}

function SummaryEntry({ x }) {
  const [active, setActive] = useState(false);
  const setSummary = useCallback(() => setActive((curr) => !curr), []);
  return h(
    "div",
    null,
    h(
      "button",
      { class: "summary-view hoverable", onCLick: setSummary },
      "By: ",
      x.summary_by || "Unknown"
    ),
    active && h("div", { class: "summary-data" }, x.text)
  );
}
