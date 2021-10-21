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
  if(imageExtensions.includes(fileExtension.toLowerCase())) {
    return 'image'
  }
  if(videoExtensions.includes(fileExtension.toLowerCase())) {
    return 'video';

  }
  return false;
}

export default isImageOrVideo;
