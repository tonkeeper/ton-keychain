import { Account } from '../account';
import { HDAccount } from 'viem/accounts';

export class EthAccount extends Account {
    get address(): string {
        return this.account.address;
    }

    readonly privateKey: string;

    constructor(public readonly mnemonics: string[], public readonly account: HDAccount) {
        super();
        this.privateKey = Buffer.from(this.account.getHdKey().privateKey!).toString('hex');
    }
}
