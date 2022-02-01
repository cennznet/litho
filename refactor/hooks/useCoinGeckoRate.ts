import { useEffect, useState } from "react";

export default function useCoinGeckoRate(
	to: string,
	from: string = "centrality"
) {
	const [rate, setRate] = useState<number>();

	useEffect(() => {
		const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`;
		async function fetchRate() {
			const response = await fetch(coinGeckoUrl).then((response) =>
				response.json()
			);

			setRate(response?.[from]?.[to]);
		}

		fetchRate();
	}, [from, to]);

	return rate;
}
