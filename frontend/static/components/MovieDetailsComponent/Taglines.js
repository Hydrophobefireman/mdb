import { h, useState, useCallback } from "@hydrophobefireman/ui-lib";
export function Taglines({ taglines }) {
  const [index, setIndex] = useState(0);
  const getNext = useCallback(() => {
    if (!taglines) return;
    let next = index + 1;
    const taglinesLength = taglines.length;
    if (taglinesLength === next) next = 0;
    setIndex(next);
  }, [taglines, index]);

  return h(
    "div",
    {
      class: "fancy-text pointer",
      style: { fontSize: "4rem" },
      onClick: getNext,
    },
    taglines && taglines[index]
  );
}
