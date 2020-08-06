import { rotate } from "../../utils/styles";
import { h } from "@hydrophobefireman/ui-lib";
export const FancyText = (() => {
  const getText = (txt) => h("span", null, txt);
  const getTilted = (txt, tiltValue) =>
    h(
      "span",
      {
        style: { transform: rotate(tiltValue), display: "inline-block" },
      },
      txt
    );
  return (props) => {
    const { text, fancyCharacter: fc, tiltValue = -30 } = props;
    const children = [];
    const curr = [];
    for (const i of text) {
      if (i !== fc) {
        curr.push(i);
      } else {
        children.push(getText(curr.join("")));
        children.push(getTilted(i, tiltValue));
        curr.length = 0;
      }
    }
    if (curr.length) children.push(getText(curr.join("")));
    return h("div", { class: "fancy-text" }, children);
  };
})();
