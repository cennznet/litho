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
  };

  static defaultProps = {
    format: "webp",
    quality: 0.92,
  };

  state = {
    image: {},
  };

  componentDidMount() {
    this.node.addEventListener("load", this.convert);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.imageUrl !== this.state.image.url;
  }

  setRef = (node) => {
    this.node = node;
  };

  convert = () => {
    try {
      const {
        props: { format, quality, imageUrl },
      } = this;
      const dataImage = localStorage.getItem(imageUrl);
      if (dataImage) {
        this.setState({ image: { data: dataImage, url: imageUrl } });
      } else {
        const cid = imageUrl.split("ipfs/")[1]; // only for image from ipfs... not for image user uploads
        if (imageUrl !== this.state.image.url && cid) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          ctx.drawImage(
            this.node,
            0,
            0,
            this.node.width,
            this.node.height,
            0,
            0
          );
          const convertedImage = canvas.toDataURL(`image/${format}`, quality);
          const imgData = convertedImage.replace(
            /^data:image\/(png|jpg|webp);base64,/,
            ""
          );
          this.setState({ image: { data: imgData, url: imageUrl } });
          localStorage.setItem(imageUrl, imgData);
        }
      }
    } catch (e) {}
  };

  render() {
    const {
      props: { imageUrl, className, onLoad, onError },
    } = this;

    return (
      <img
        alt={""}
        crossOrigin={"anonymous"}
        className={className}
        ref={this.setRef}
        src={
          imageUrl === this.state.image.url
            ? `data:image/webp;base64,${this.state.image.data}`
            : imageUrl
        }
        onLoad={onLoad}
        onError={onError}
      />
    );
  }
}

export default ConvertImageWebp;
