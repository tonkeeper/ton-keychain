import { Account } from '../account';
import { ethers } from 'ethers';
import { TronAddress } from './utils';

export class TrxAccount extends Account {
    get hexAddress(): string {
        return this.account.address;
    }

    get privateKey(): string {
        return this.account.privateKey;
    }

    get publicKey(): string {
        return this.account.publicKey;
    }

    readonly address: string;

    constructor(public readonly mnemonics: string[], public readonly account: ethers.HDNodeWallet) {
        super();
        this.address = TronAddress.hexToBase58(this.hexAddress);
    }
}
