import { ethers } from 'ethers';
import { TronAddress } from './utils';

export class MamTrxAccount {
    get hexAddress(): string {
        return this.hdAccount.address;
    }

    get privateKey(): string {
        return this.hdAccount.privateKey;
    }

    get publicKey(): string {
        return this.hdAccount.publicKey;
    }

    readonly address: string;

    constructor(readonly hdAccount: ethers.HDNodeWallet) {
        this.address = TronAddress.hexToBase58(this.hexAddress);
    }
}
