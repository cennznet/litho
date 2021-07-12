const imageAndVideoExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
  "mp4",
  "mov",
];

const isImageOrVideo = (fileExtension) => imageAndVideoExtensions.includes(fileExtension);
export default isImageOrVideo;