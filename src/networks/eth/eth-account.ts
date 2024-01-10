import { Account } from '../account';
import { HDAccount } from 'viem/accounts';

export class EthAccount extends Account {
    get address(): string {
        return this.account.address;
    }

    readonly privateKey: string;

    readonly publicKey: string;

    constructor(public readonly mnemonics: string[], public readonly account: HDAccount) {
        super();
        this.privateKey = '0x' + Buffer.from(this.account.getHdKey().privateKey!).toString('hex');
        this.publicKey = '0x' + Buffer.from(this.account.getHdKey().publicKey!).toString('hex');
    }
}
