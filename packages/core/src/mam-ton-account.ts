import { mnemonicToPrivateKey } from '@ton/crypto';
import { mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';

export class MamTonAccount {
    static MNEMONICS_WORDS_NUMBER = 24;

    static async fromMnemonics(mnemonics: string[]): Promise<MamTonAccount> {
        const [keypair, entropy] = await Promise.all([
            mnemonicToPrivateKey(mnemonics),
            mnemonicToEntropy(mnemonics)
        ]);
        return new MamTonAccount(
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
