import { getSecureRandomNumber, hmac_sha512, mnemonicValidate, pbkdf2_sha512 } from '@ton/crypto';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac_sha256 } from './networks/ton/utils';
import { TonAccount } from './networks/ton/ton-account';
import { bytesToMnemonics, mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';

export class RootAccount {
    private static ID_PREFIX = 0b0010100000101101; // base64 "KC" + 1101 constant

    static async generate(wordsCount: number = 24) {
        let mnemonicArray: string[] = [];

        for (let i = 0; i < 0xffffffff; i++) {
            const _mnemonicArray = [];
            for (let i = 0; i < wordsCount; i++) {
                let ind = await getSecureRandomNumber(0, wordlist.length);
                _mnemonicArray.push(wordlist[ind]);
            }

            if (await this.isValidMnemonic(_mnemonicArray)) {
                mnemonicArray = _mnemonicArray;
                break;
            }
        }

        if (!mnemonicArray) {
            throw new Error('Root mnemonics was not found in 2^32 iterations');
        }

        return this.fromMnemonic(mnemonicArray);
    }

    public static async fromMnemonic(mnemonic: string[]) {
        const isValid = await this.isValidMnemonic(mnemonic);
        if (!isValid) {
            throw new Error('Mnemonic is not compatible with Tonkeeper Root account recovery');
        }
        const id = await this.calculateId(mnemonic);
        return new RootAccount(mnemonic, id);
    }

    private static async isValidMnemonic(mnemonic: string[]) {
        const mnemonicHash = await hmac_sha512('Ton Keychain', mnemonic.join(' '));
        const result = await pbkdf2_sha512(mnemonicHash, 'TON root fast seed version', 1, 64);
        return result[0] === 0;
    }

    private static async calculateId(mnemonic: string[]) {
        const id = await hmac_sha256('Root ID', mnemonic.join(' '));
        const prefix = Buffer.alloc(2);
        prefix.writeUint16BE(this.ID_PREFIX);

        return Buffer.concat([prefix, id.subarray(0, 16)]).toString('base64url');
    }

    private ACCOUNT_LABEL = (n: number) => `serial:${n}`;

    private constructor(readonly mnemonic: string[], readonly id: string) {}

    public getTonAccount = async (index: number): Promise<TonAccount> => {
        const rootEntropy = await mnemonicToEntropy(this.mnemonic);
        const childEntropy = await hmac_sha256(this.ACCOUNT_LABEL(index), rootEntropy);
        const { mnemonics } = await this.entropyToTonCompatibleSeed(childEntropy);
        return TonAccount.fromMnemonics(mnemonics);
    };

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
                (TonAccount.MNEMONICS_WORDS_NUMBER * 11) / 8
            );
            const mnemonics = bytesToMnemonics(iterationSeed, TonAccount.MNEMONICS_WORDS_NUMBER);

            if (await mnemonicValidate(mnemonics)) {
                return { seed: iterationSeed, mnemonics };
            }
        }
        throw new Error('Ton mnemonics was not found in 2^32 iterations');
    }
}
