import { AccountsProvider } from '../accounts-provider';
import { hmac_sha256 } from './utils';
import { hmac_sha512, mnemonicValidate } from '@ton/crypto';
import { bytesToMnemonics, mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';
import { TonAccount } from './ton-account';

export class TonAccountsProvider extends AccountsProvider {
    static async fromSeed(seed: Buffer): Promise<TonAccountsProvider> {
        const mnemonics = bytesToMnemonics(seed, this.MNEMONICS_WORDS_NUMBER);
        return this.fromMnemonics(mnemonics);
    }

    static async fromMnemonics(mnemonics: string[]): Promise<TonAccountsProvider> {
        const account = await TonAccount.fromMnemonics(mnemonics);
        return new TonAccountsProvider(account);
    }

    static MNEMONICS_WORDS_NUMBER = 24;

    private constructor(readonly rootAccount: TonAccount) {
        super();
    }

    public async generateChildAccount(label: string): Promise<TonAccount> {
        const rootEntropy = await mnemonicToEntropy(this.rootAccount.mnemonics);
        const childEntropy = await hmac_sha256(label, rootEntropy);
        const { mnemonics } = await this.entropyToTonCompatibleSeed(childEntropy);
        return TonAccount.fromMnemonics(mnemonics);
    }

    private async entropyToTonCompatibleSeed(
        entropy: Buffer
    ): Promise<{ seed: Buffer; mnemonics: string[] }> {
        const SEQNO_SIZE_BYTES = 4;

        // less than 1 of 10^200 probability to not find correct mnemonics
        const maxSeqno = 0xffffffff; // 2^(SEQNO_SIZE_BYTES * 8) - 1
        for (let i = 0; i < maxSeqno; i++) {
            const hmacData = Buffer.alloc(SEQNO_SIZE_BYTES);
            hmacData.writeUint32BE(i);

            // get 512 bits hash and slice first 264 bits in order to get enough bits for 24 words mnemonics
            const iterationEntropy = await hmac_sha512(hmacData, entropy);
            const iterationSeed = iterationEntropy.subarray(
                0,
                (TonAccountsProvider.MNEMONICS_WORDS_NUMBER * 11) / 8
            );
            const mnemonics = bytesToMnemonics(
                iterationSeed,
                TonAccountsProvider.MNEMONICS_WORDS_NUMBER
            );

            if (await mnemonicValidate(mnemonics)) {
                return { seed: iterationSeed, mnemonics };
            }
        }
        throw new Error('Ton mnemonics was not found in 2^32 iterations');
    }
}
