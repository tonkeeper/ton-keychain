import * as crypto from 'crypto';
import {entropyToTonCompatibleSeed, entropyToTonCompatibleSeed2, WORDS_NUMBER} from "../src";
import {mnemonicValidate, sha256} from "ton-crypto";
import {bytesToMnemonics} from "ton-crypto/dist/mnemonic/mnemonic";
import {hmac_sha256} from "../src/utils";

describe('convert entropy to Ton compatible seed', () => {
    it('from random entropy', async () => {
        const seedSizeBytes = WORDS_NUMBER * 11 / 8;
        const entropy = Buffer.alloc(256 / 8);
        crypto.randomFillSync(entropy);

        const tonSeed = await entropyToTonCompatibleSeed(entropy);
        expect(tonSeed.length).toBe(seedSizeBytes);

        const mnemonic =  bytesToMnemonics(tonSeed, WORDS_NUMBER);
        const isValidMnemonic = await mnemonicValidate(mnemonic);
        expect(isValidMnemonic).toBeTruthy();
    })

    it('from random seed', async () => {
        const seedSizeBytes = WORDS_NUMBER * 11 / 8;
        const seed = Buffer.alloc(seedSizeBytes);
        crypto.randomFillSync(seed);
        const entropy = await hmac_sha256(seed, 'ton-label-example');

        const tonSeed = await entropyToTonCompatibleSeed(entropy);
        expect(tonSeed.length).toBe(seedSizeBytes);

        const mnemonic =  bytesToMnemonics(tonSeed, WORDS_NUMBER);
        const isValidMnemonic = await mnemonicValidate(mnemonic);
        expect(isValidMnemonic).toBeTruthy();
    })
})
