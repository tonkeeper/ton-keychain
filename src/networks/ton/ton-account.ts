import { Account } from '../account';
import { mnemonicToPrivateKey } from 'ton-crypto';

export class TonAccount extends Account {
    static async fromMnemonics(mnemonics: string[]): Promise<TonAccount> {
        const keypair = await mnemonicToPrivateKey(mnemonics);
        return new TonAccount(mnemonics, keypair.secretKey.toString('hex'));
    }

    constructor(public readonly mnemonics: string[], readonly privateKey: string) {
        super();
    }
}
