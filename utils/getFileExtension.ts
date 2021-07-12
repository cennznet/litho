const getFileExtension = (fileName) => {
  const lastDotInName = fileName.replace('https://ipfs.io/').lastIndexOf('.');
  if(lastDotInName < 0) {
    return null;
  }
  const fileExtension = fileName.substr(lastDotInName + 1);
  return fileExtension;
}

export default getFileExtension;