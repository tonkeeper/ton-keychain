import { mnemonicToPrivateKey } from '@ton/crypto';
import { mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';

export class KeychainTonAccount {
    static MNEMONICS_WORDS_NUMBER = 24;

    static async fromMnemonic(mnemonics: string[]): Promise<KeychainTonAccount> {
        const [keypair, entropy] = await Promise.all([
            mnemonicToPrivateKey(mnemonics),
            mnemonicToEntropy(mnemonics)
        ]);
        return new KeychainTonAccount(
            mnemonics,
            keypair.secretKey.toString('hex'),
            keypair.publicKey.toString('hex'),
            entropy
        );
    }

    constructor(
        public readonly mnemonics: string[],
        public readonly privateKey: string,
        public readonly publicKey: string,
        public readonly entropy: Buffer
    ) {}
}
