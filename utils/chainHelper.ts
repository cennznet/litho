import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { bnToBn, extractTime, hexToU8a, isHex } from "@polkadot/util";

export const GetRemaindedTime = (api, blocks: number) => {
  const blockTime = api.consts.babe.expectedBlockTime;
  const value = blockTime.mul(bnToBn(blocks)).toNumber();
  const time = extractTime(Math.abs(value));
  return time;
}

export const isValidAddressPolkadotAddress = (address: string) => {
  try {
    encodeAddress(
      isHex(address)
        ? hexToU8a(address)
        : decodeAddress(address)
    );

    return true;
  } catch (error) {
    return false;
  }
};
