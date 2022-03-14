export async function handler(req, res) {
	const { symbol } = req.query;
	if (!symbol) {
		res.status(400);
		res.json({});
		return;
	}

	const mexcApiUrl = `https://www.mexc.com/open/api/v2/market/ticker?symbol=${symbol}`;
	const response = await fetch(mexcApiUrl, { mode: "no-cors" });
	const json = await response.json();
	res.status(response.status);
	res.json(json?.data?.[0]);
}
