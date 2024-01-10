import { hmac_sha512, mnemonicValidate } from '@ton/crypto';
import { hmac_sha256 } from './utils';
import { bytesToMnemonics } from '@ton/crypto/dist/mnemonic/mnemonic';

export const WORDS_NUMBER = 24;

export async function getChildMnemonics(seedOrEntropy: Buffer, label: string): Promise<string[]> {
    const childEntropy = await hmac_sha256(label, seedOrEntropy);
    const { mnemonics } = await entropyToTonCompatibleSeed(childEntropy);
    return mnemonics;
}

export async function entropyToTonCompatibleSeed(
    entropy: Buffer
): Promise<{ seed: Buffer; mnemonics: string[] }> {
    // 32-bit space is enough to find a valid mnemonic with ≈1-10^200 chance.
    for (let i = 0; i < 0xffffffff; i++) {
        const hmacData = Buffer.alloc(4);
        hmacData.writeUint32BE(i);

        // get 512 bits hash and slice first 264 bits in order to get enough bits for 24 words mnemonics
        const iterationEntropy = await hmac_sha512(hmacData, entropy);
        const iterationSeed = iterationEntropy.subarray(0, (WORDS_NUMBER * 11) / 8);
        const mnemonics = bytesToMnemonics(iterationSeed, WORDS_NUMBER);

        if (await mnemonicValidate(mnemonics)) {
            return { seed: iterationSeed, mnemonics };
        }
    }
    throw new Error('Ton mnemonics was not found in 2^32 iterations');
}
