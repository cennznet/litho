import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useEffect, useState } from "react";
import { bnToBn, extractTime } from "@polkadot/util";
import { Time } from "@polkadot/util/types";

/**
 * A hook to parse the remaining time from a block number
 *
 * @param {number} endBlock
 * @return {Time}
 */
export default function useEndTime(endBlock: number): Time {
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

	if (days >= 1) {
		const remaining = days + Math.round(hours / 24);
		return `Ending in ${remaining} ${remaining > 1 ? "days" : "day"}`;
	}

	return `Ending in ${hours >= 10 ? hours : `0${hours}`}:${
		minutes >= 10 ? minutes : `0${minutes}`
	}`;
}
