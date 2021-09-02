const getFileExtension = (fileName) => {
  const name = fileName.replace('https://ipfs.io/').replace('https://gateway.pinata.cloud/ipfs/');
  const lastDotInName = name.lastIndexOf('.');

  if(lastDotInName < 0) {
    if(fileName.startsWith('https://gateway')) {
      return 'jpg';
    }
    return 'null';
  }
  const fileExtension = name.substr(lastDotInName + 1);
  return fileExtension;
}

export default getFileExtension;