const getMetadata = (attributes) => {
  let metadataUrl;
  if(attributes.length === 1 && attributes[0].Url) {
    metadataUrl = attributes[0].Url;
  } else {
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if(!attr.Url) {
        continue;
      }
      const attrString = attr.Url.split(' ');
      if(attrString.length === 2 && ["metadata", "metadata-url"].includes(attrString[0].toLowerCase())) {
        metadataUrl =  attrString[1];
        break;
      }
    }
  }
  if(metadataUrl)
    return metadataUrl.replace('https://gateway.pinata.cloud/ipfs/', 'ipfs://');
  return null;
}

export default getMetadata;