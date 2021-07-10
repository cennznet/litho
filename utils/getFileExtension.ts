const getFileExtension = (fileName) => {
  const lastDotInName = fileName.lastIndexOf('.');
  const fileExtension = fileName.substr(lastDotInName + 1);
  return fileExtension;
}

export default getFileExtension;