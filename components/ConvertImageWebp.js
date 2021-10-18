/**
 *
 * ConvertImage module
 *
 */

import React, { Component } from "react";
import PropTypes from "prop-types";

class ConvertImageWebp extends Component {
  static propTypes = {
    imageUrl: PropTypes.string.isRequired,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    format: PropTypes.oneOf(["webp", "jpeg", "png"]),
    quality: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  static defaultProps = {
    format: "webp",
    quality: 0.92,
  };

  state = {
    convertedImage: undefined,
    urlConverted: undefined,
  };

  componentDidMount() {
    this.node.addEventListener("load", this.convert);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.imageUrl !== this.state.urlConverted;
  }

  setRef = (node) => {
    this.node = node;
  };

  convert = () => {
    try {
      const {
        props: { format, quality, imageUrl },
      } = this;
      if (imageUrl !== this.state.urlConverted) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.node, 0, 0);
        const convertedImage = canvas.toDataURL(`image/${format}`, quality);
        this.setState({ urlConverted: imageUrl });
        this.setState({ convertedImage: convertedImage });
      }
    } catch (e) {
      console.log("err:", e);
    }
  };

  render() {
    const {
      props: { imageUrl, className, width, height, onLoad, onError },
    } = this;

    return (
      <img
        alt={""}
        width={width}
        height={height}
        crossOrigin={"anonymous"}
        className={className}
        ref={this.setRef}
        src={imageUrl}
        onload={onLoad}
        onerror={onError}
      />
    );
  }
}

export default ConvertImageWebp;
