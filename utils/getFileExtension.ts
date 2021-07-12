const getFileExtension = (fileName) => {
  const name = fileName.replace('https://ipfs.io/');
  const lastDotInName = name.lastIndexOf('.');

  if(lastDotInName < 0) {
    return null;
  }
  const fileExtension = name.substr(lastDotInName + 1);
  return fileExtension;
}

export default getFileExtension;