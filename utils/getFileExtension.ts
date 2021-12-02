const getFileExtension = (contentType) => {

  if(contentType.startsWith('image/')) {
    if(contentType.includes('svg')) {
      return 'svg';
    }
    if(contentType.includes('jpg') || contentType.includes('jpeg')) {
      return 'jpg';
    }
    if(contentType.includes('png')) {
      return 'png';
    }
    if(contentType.includes('gif')) {
      return 'gif';
    }
    if(contentType.includes('webp')) {
      return 'webp';
    }
  }
  if(contentType.startsWith('video/')) {
    if(contentType.includes("mp4")) {
      return "mp4";
    }
    if(contentType.includes("mov")) {
      return "mov";
    }
    if(contentType.includes("ogg")) {
      return "ogg";
    }
    if(contentType.includes("wmv")) {
      return "wmv";
    }
    if(contentType.includes("webm")) {
      return "webm";
    }
  }

  const extensionMatch = contentType.match(/.*\/(.*)/);
  if(extensionMatch.length > 0) {
    return extensionMatch[1];
  }
}

export default getFileExtension;
