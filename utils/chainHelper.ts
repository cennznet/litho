import { bnToBn, extractTime } from "@polkadot/util";

export const GetRemaindedTime = (api, blocks: number) => {
  const blockTime = api.consts.babe.expectedBlockTime;
  const value = blockTime.mul(bnToBn(blocks)).toNumber();
  const time = extractTime(Math.abs(value));
  return time;
}