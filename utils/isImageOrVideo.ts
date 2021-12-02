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
  "webm",
  "mov"
];

const isImageOrVideo = (fileExtension) => {
  if(fileExtension && imageExtensions.includes(fileExtension.toLowerCase())) {
    return 'image'
  }
  if(fileExtension && videoExtensions.includes(fileExtension.toLowerCase())) {
    return 'video';

  }
  return false;
}

export default isImageOrVideo;
