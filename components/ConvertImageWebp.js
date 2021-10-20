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
  };

  static defaultProps = {
    format: "png",
  };

  state = {
    image: {},
  };
  highResPixel = 10000000;

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
        props: { format, imageUrl },
      } = this;
      const dataImage = localStorage.getItem(imageUrl);
      if (dataImage) {
        this.setState({ image: { data: dataImage, url: imageUrl } });
      } else {
        const cid = imageUrl.split("ipfs/")[1]; // only for image from ipfs... not for image user uploads
        if (imageUrl !== this.state.image.url && cid) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 500;
          canvas.height = 500;
          const imgWidth = this.node.naturalWidth;
          const imgHeight = this.node.naturalHeight;

          const resolution = imgHeight * imgWidth;
          if (resolution > this.highResPixel) {
            canvas.width = 1000;
            canvas.height = 1000;
          }

          const hRatio = canvas.width / imgWidth;
          const vRatio = canvas.height / imgHeight;
          const ratio = Math.min(hRatio, vRatio);
          const centerShift_x = (canvas.width - imgWidth * ratio) / 2;
          const centerShift_y = (canvas.height - imgHeight * ratio) / 2;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(
            this.node,
            0,
            0,
            imgWidth,
            imgHeight,
            centerShift_x,
            centerShift_y,
            imgWidth * ratio,
            imgHeight * ratio
          );
          const convertedImage = canvas.toDataURL(`image/${format}`);
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
      <div>
        <a href={imageUrl}>
          <img
            alt={""}
            crossOrigin={"anonymous"}
            className={className}
            ref={this.setRef}
            src={
              imageUrl === this.state.image.url
                ? `data:image/png;base64,${this.state.image.data}`
                : imageUrl
            }
            onLoad={onLoad}
            onError={onError}
          />
        </a>
      </div>
    );
  }
}

export default ConvertImageWebp;
