import {pbkdf2_sha512} from "ton-crypto-primitives";
import {wordlist} from "./wordlist";
import {mnemonicValidate} from "ton-crypto";
import {bytesToBits} from "ton-crypto/dist/utils/binary";

const PBKDF_ITERATIONS = 100000;
export const WORDS_NUMBER = 24;
const SEQNO_SIZE_BYTES = 4;

/**
 * Оно же F
 */
export async function tonMnemonicFromSeed(seed: Buffer, password?: string | null | undefined): Promise<string[]> {
    const bytesLength = Math.ceil(WORDS_NUMBER * 11 / 8);
    const maxSeqno = Math.pow(2, SEQNO_SIZE_BYTES * 8) - 1;

    for (let seqno = 0; seqno < maxSeqno; seqno++) {
        // create seed
        const iterationSeed = Buffer.alloc(seed.length + SEQNO_SIZE_BYTES);
        seed.copy(iterationSeed);
        iterationSeed.writeUintBE(seqno, seed.length, SEQNO_SIZE_BYTES);

        // Create entropy
        let entropy = await pbkdf2_sha512(iterationSeed, 'TON mnemonic seed', Math.max(1, Math.floor(PBKDF_ITERATIONS / 256)), bytesLength);

        // Create mnemonics
        let mnemonics = bytesToMnemonics(entropy, WORDS_NUMBER);

        // Check if mnemonics are valid
        if (await mnemonicValidate(mnemonics, password)) {
            return mnemonics;
        }
    }

    throw new Error('Ton mnemonics was not found in 2^32 iterations');
}

export function bytesToMnemonicIndexes(src: Buffer, wordsCount: number) {
    let bits = bytesToBits(src);
    let indexes: number[] = [];
    for (let i = 0; i < wordsCount; i++) {
        let sl = bits.slice(i * 11, i * 11 + 11);
        indexes.push(parseInt(sl, 2));
    }
    return indexes;
}

export function bytesToMnemonics(src: Buffer, wordsCount: number) {
    let mnemonics = bytesToMnemonicIndexes(src, wordsCount);
    let res: string[] = [];
    for (let m of mnemonics) {
        res.push(wordlist[m]);
    }
    return res;
}
