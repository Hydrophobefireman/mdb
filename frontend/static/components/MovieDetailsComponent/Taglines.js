import { h, useState, useEffect, useCallback } from "@hydrophobefireman/ui-lib";
export function Taglines({ taglines }) {
  const [current, setCurrent] = useState(null);
  const getRandom = useCallback(() => {
    let next;
    while (
      (next = taglines[Math.floor(Math.random() * taglines.length)]) == current
    ) {}
    setCurrent(next);
  }, [taglines, current]);
  useEffect(getRandom, [taglines]);
  return h(
    "div",
    {
      class: "fancy-text pointer",
      style: { fontSize: "4rem" },
      onClick: getRandom,
    },
    current
  );
}
