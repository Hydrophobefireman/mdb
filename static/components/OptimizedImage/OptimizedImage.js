import { Component, h } from "@hydrophobefireman/ui-lib";
import entries from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/entries";
import assign from "@hydrophobefireman/j-utils/@build-modern/src/modules/Object/assign";

import CloudinaryImage from "./CloudinaryImage";
export default class OptimizedImage extends Component {
  extractProps() {
    const { src, children: _, ...config } = this.props;
    return { src, config };
  }
  init() {
    const { src, config } = this.extractProps();

    const image = new CloudinaryImage(src);
    const lowQualURL = image.set("w", 5).set("f", "auto").get();

    entries(config).forEach(([key, val]) => image.set(key, val));

    this.setState({ lowQualURL, image });
  }
  async componentDidUpdate(oldProps) {
    const { src, config } = this.extractProps();
    if (oldProps && oldProps.src !== src) {
      return this.init();
    }
    if (!this.loadedFullQualityImage) {
      this.setState({
        loadedFullQualityImage: await this.state.image.preloadImage(),
      });
    }
  }

  componentDidMount() {
    this.init();
  }

  render(_props, state) {
    const { height, h: _h, w, width, src, ...props } = _props;
    const backgroundImageURL = state.loadedFullQualityImage
      ? this.state.image.get()
      : state.lowQualURL;

    props.style = props.style || {};
    const wdth = `${width || w}px`;
    const ht = `${height || _h}px`;

    assign(props.style, { width: wdth, height: ht });

    const style = backgroundImageURL
      ? { backgroundImage: `url(${backgroundImageURL})` }
      : null;

    return h("div", {
      class: "opt-image",
      style,
    });
  }
}
