import { getSecureRandomNumber, hmac_sha512, mnemonicValidate, pbkdf2_sha512 } from '@ton/crypto';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac_sha256 } from './utils';
import { KeychainTonAccount } from './keychain-ton-account';
import { bytesToMnemonics, mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';

export class TonKeychainRoot {
    private static ID_PREFIX = 0x4cad; // base64 "TK" + 1101 constant

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
        return new TonKeychainRoot(mnemonic, id);
    }

    /**
     * @description DANGER
     * Should only be used to process legacy already created mnemonics
     * @param mnemonic
     */
    public static async isValidMnemonicLegacy(mnemonic: string[]) {
        const mnemonicHash = await hmac_sha512('TON Keychain', mnemonic.join(' '));
        const result = await pbkdf2_sha512(mnemonicHash, 'TON Keychain Version', 1, 64);
        return result[0] === 0;
    }

    public static async isValidMnemonic(mnemonic: string[]) {
        const isLegacyValid = await this.isValidMnemonicLegacy(mnemonic);
        if (!isLegacyValid) {
            return false;
        }

        const isTonCompatible = await mnemonicValidate(mnemonic);
        return !isTonCompatible;
    }

    private static async calculateId(mnemonic: string[]) {
        const id = await hmac_sha256('Keychain ID', mnemonic.join(' '));
        const prefix = Buffer.alloc(2);
        prefix.writeUint16BE(this.ID_PREFIX);

        return Buffer.concat([prefix, id.subarray(0, 16)])
            .toString('base64')
            .replaceAll('+', '-')
            .replaceAll('/', '_');
    }

    private ACCOUNT_LABEL = (n: number) => `account:${n}`;

    private SUB_ROOT_ACCOUNT_LABEL = (n: number) => `keychain:${n}`;

    private constructor(readonly mnemonic: string[], readonly id: string) {}

    public getTonAccount = async (index: number): Promise<KeychainTonAccount> => {
        const rootEntropy = await mnemonicToEntropy(this.mnemonic);
        const childEntropy = await hmac_sha256(this.ACCOUNT_LABEL(index), rootEntropy);
        const { mnemonics } = await this.entropyToTonCompatibleSeed(childEntropy);
        return KeychainTonAccount.fromMnemonic(mnemonics);
    };

    public getSubRootAccount = async (index: number): Promise<TonKeychainRoot> => {
        const rootEntropy = await mnemonicToEntropy(this.mnemonic);
        const childEntropy = await hmac_sha256(this.SUB_ROOT_ACCOUNT_LABEL(index), rootEntropy);
        const { mnemonics } = await this.entropyToRootCompatibleSeed(childEntropy);
        return TonKeychainRoot.fromMnemonic(mnemonics);
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
                (KeychainTonAccount.MNEMONICS_WORDS_NUMBER * 11) / 8
            );
            const mnemonics = bytesToMnemonics(
                iterationSeed,
                KeychainTonAccount.MNEMONICS_WORDS_NUMBER
            );

            if (await mnemonicValidate(mnemonics)) {
                return { seed: iterationSeed, mnemonics };
            }
        }
        throw new Error('Ton mnemonics was not found in 2^32 iterations');
    }

    private async entropyToRootCompatibleSeed(
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
                (KeychainTonAccount.MNEMONICS_WORDS_NUMBER * 11) / 8
            );
            const mnemonics = bytesToMnemonics(
                iterationSeed,
                KeychainTonAccount.MNEMONICS_WORDS_NUMBER
            );

            if (await TonKeychainRoot.isValidMnemonic(mnemonics)) {
                return { seed: iterationSeed, mnemonics };
            }
        }
        throw new Error('Ton mnemonics was not found in 2^32 iterations');
    }
}
