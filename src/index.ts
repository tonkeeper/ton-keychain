import { mnemonicValidate, sha256} from "ton-crypto";
import {hmac_sha256} from "./utils";
import {bytesToMnemonics} from "ton-crypto/dist/mnemonic/mnemonic";

export const WORDS_NUMBER = 24;

export async function entropyToTonCompatibleSeed(entropy: Buffer) {
    const SEQNO_SIZE_BYTES = 4;
    const maxSeqno = Math.pow(2, SEQNO_SIZE_BYTES * 8) - 1;
    for (let i= 0; i < maxSeqno; i++) {
        const hmacData = Buffer.alloc(SEQNO_SIZE_BYTES);
        hmacData.writeUint32BE(i);

        const iterationEntropy = await hmac_sha256(entropy, hmacData);
        const checkSum = await sha256(iterationEntropy);
        const iterationSeed = Buffer.concat([iterationEntropy, checkSum.subarray(0, 1)]);
        const mnemonics = bytesToMnemonics(iterationSeed, WORDS_NUMBER);

        if (await mnemonicValidate(mnemonics)) {
            return iterationSeed;
        }
    }
    throw new Error('Ton mnemonics was not found in 2^32 iterations');
}

