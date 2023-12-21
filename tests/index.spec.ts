import * as crypto from 'crypto';
import {tonMnemonicFromSeed, WORDS_NUMBER} from "../src";

describe('mnemonic generation', () => {
    it('generates mnemonics from seed', async () => {
        const seedSizeBytes = WORDS_NUMBER * 11 / 8;
        const seed = Buffer.alloc(seedSizeBytes);
        crypto.randomFillSync(seed);

        const mnemonic = await tonMnemonicFromSeed(seed);
        expect(mnemonic.length).toBe(WORDS_NUMBER);
        expect(mnemonic[0]).toBeTruthy();
        console.log(mnemonic);
    })
})
