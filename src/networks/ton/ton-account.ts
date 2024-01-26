import { mnemonicToPrivateKey } from '@ton/crypto';
import { Address, WalletContractV4 } from '@ton/ton';
import { mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';

export class TonAccount {
    /**
     * Wallet w4r2 address
     */
    readonly address: Address;

    static MNEMONICS_WORDS_NUMBER = 24;

    static async fromMnemonics(mnemonics: string[]): Promise<TonAccount> {
        const [keypair, entropy] = await Promise.all([
            mnemonicToPrivateKey(mnemonics),
            mnemonicToEntropy(mnemonics)
        ]);
        return new TonAccount(
            mnemonics,
            '0x' + keypair.secretKey.toString('hex'),
            '0x' + keypair.publicKey.toString('hex'),
            entropy
        );
    }

    constructor(
        public readonly mnemonics: string[],
        public readonly privateKey: string,
        public readonly publicKey: string,
        public readonly entropy: Buffer
    ) {
        let workchain = 0;
        const wallet = WalletContractV4.create({
            workchain,
            publicKey: Buffer.from(publicKey.slice(2), 'hex')
        });

        this.address = wallet.address;
    }
}
