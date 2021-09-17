const getMetadata = (attributes) => {
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if(!attr.Url) {
      continue;
    }
    const attrString = attr.Url.split(' ');
    if(attrString.length === 2 && attrString[0].toLowerCase() === 'metadata') {
      return attrString[1];
    }
  }
}

export default getMetadata;