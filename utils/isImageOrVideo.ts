const imageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
];

const videoExtensions = [
  "mp4",
  "ogg",
  "wmv",
  "webm"
];

const isImageOrVideo = (fileExtension) => {
  if(imageExtensions.includes(fileExtension)) {
    return 'image'
  }
  if(videoExtensions.includes(fileExtension)) {
    return 'video';

  }
  return false;
}

export default isImageOrVideo;