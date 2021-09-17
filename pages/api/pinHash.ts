const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.API_KEY, process.env.API_SECRET);

export default async (req, res) => {
  const { hash } = req.query;
  await pinata.testAuthentication().then(() => {
    return pinata.pinByHash(hash).then((response) => {
      console.log(response);
    }).catch(err => console.log(err));
  })

  res.statusCode = 200;
  res.json({ hash });
};