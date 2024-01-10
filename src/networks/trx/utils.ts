import { decodeBase58, encodeBase58, sha256 } from 'ethers';

export const TronAddress = {
    hexToBase58(address: string): string {
        const tronAddressPayload = '0x' + '41' + address.slice(2);
        const checkSumTail = sha256(sha256(tronAddressPayload)).slice(2, 10);
        return encodeBase58(tronAddressPayload + checkSumTail);
    },
    base58ToHex(address: string): string {
        const decoded = decodeBase58(address).toString(16);
        return decoded.slice(0, -8);
    }
};
