import { Account } from '../account';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { Address, WalletContractV4 } from '@ton/ton';

export class TonAccount extends Account {
    /**
     * Wallet w4r2 address
     */
    readonly address: Address;

    static async fromMnemonics(mnemonics: string[]): Promise<TonAccount> {
        const keypair = await mnemonicToPrivateKey(mnemonics);
        return new TonAccount(
            mnemonics,
            '0x' + keypair.secretKey.toString('hex'),
            '0x' + keypair.publicKey.toString('hex')
        );
    }

    constructor(
        public readonly mnemonics: string[],
        public readonly privateKey: string,
        public readonly publicKey: string
    ) {
        super();
        let workchain = 0;
        const wallet = WalletContractV4.create({
            workchain,
            publicKey: Buffer.from(publicKey.slice(2), 'hex')
        });

        this.address = wallet.address;
    }
}
