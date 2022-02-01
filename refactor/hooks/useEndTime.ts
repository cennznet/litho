import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useEffect, useState } from "react";
import { bnToBn, extractTime } from "@polkadot/util";
import { Time } from "@polkadot/util/types";

export default function useEndTime(endBlock: number) {
	const api = useCENNZApi();
	const [currentBlock, setCurrentBlock] = useState<number>();
	const [endTime, setEndTime] = useState<Time>();

	useEffect(() => {
		if (!api) return;
		async function fetchCurrentBlock() {
			const currentBlock = (
				await api.rpc.chain.getBlock()
			).block.header.number.toNumber();

			setCurrentBlock(currentBlock);
		}

		fetchCurrentBlock();
	}, [api]);

	useEffect(() => {
		if (!api || !currentBlock || !endBlock) return;
		const blockTime = api.consts.babe.expectedBlockTime;
		setEndTime(getRemainingTime(blockTime, endBlock, currentBlock));
	}, [api, currentBlock, endBlock]);

	return endTime;
}

export function getRemainingTime(
	blockTime: any,
	endBlock: number,
	currentBlock: number
): Time {
	const blocks = endBlock - currentBlock;
	const value = blockTime.mul(bnToBn(blocks)).toNumber();
	return extractTime(Math.abs(value));
}

export function getFriendlyEndTimeString(endTime: Time): string {
	const { days, hours, minutes } = endTime;

	if (days >= 1) return `Ending in ${days} day${days === 1 ? "" : "s"}`;
	if (hours >= 1) return `Ending in ${hours} hour${hours === 1 ? "" : "s"}`;
	if (minutes >= 1)
		return `Ending in ${minutes} hour${minutes === 1 ? "" : "s"}`;
}
