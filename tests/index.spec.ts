import * as crypto from 'crypto';
import {
    entropyToTonCompatibleSeed,
    getChildMnemonics,
    WORDS_NUMBER,
    hmac_sha256
} from '../src/ton-child-generation-example';
import { mnemonicValidate } from '@ton/crypto';
import { bytesToMnemonics } from '@ton/crypto/dist/mnemonic/mnemonic';

describe('convert entropy to Ton compatible seed', () => {
    it('from random entropy', async () => {
        const seedSizeBytes = (WORDS_NUMBER * 11) / 8;
        const entropy = Buffer.alloc(256 / 8);
        crypto.randomFillSync(entropy);

        const { seed: tonSeed } = await entropyToTonCompatibleSeed(entropy);
        expect(tonSeed.length).toBe(seedSizeBytes);

        const mnemonic = bytesToMnemonics(tonSeed, WORDS_NUMBER);
        const isValidMnemonic = await mnemonicValidate(mnemonic);
        expect(isValidMnemonic).toBeTruthy();
    });

    it('from random seed', async () => {
        const seedSizeBytes = (WORDS_NUMBER * 11) / 8;
        const seed = Buffer.alloc(seedSizeBytes);
        crypto.randomFillSync(seed);
        const entropy = await hmac_sha256(seed, 'ton-label-example');

        const { seed: tonSeed } = await entropyToTonCompatibleSeed(entropy);
        expect(tonSeed.length).toBe(seedSizeBytes);

        const mnemonic = bytesToMnemonics(tonSeed, WORDS_NUMBER);
        const isValidMnemonic = await mnemonicValidate(mnemonic);
        expect(isValidMnemonic).toBeTruthy();
    });

    it('child mnemonic form parent seed', async () => {
        const seedSizeBytes = (WORDS_NUMBER * 11) / 8;
        const seed = Buffer.alloc(seedSizeBytes);
        crypto.randomFillSync(seed);

        const child1Mnemonics = await getChildMnemonics(seed, 'invoice_#1');
        const isValidMnemonic1 = await mnemonicValidate(child1Mnemonics);
        expect(child1Mnemonics[0]).toBeTruthy();
        expect(isValidMnemonic1).toBeTruthy();

        const child2Mnemonics = await getChildMnemonics(seed, 'invoice_#2');
        const isValidMnemonic2 = await mnemonicValidate(child2Mnemonics);
        expect(child2Mnemonics[0]).toBeTruthy();
        expect(isValidMnemonic2).toBeTruthy();
        expect(child1Mnemonics.join(' ')).not.toBe(child2Mnemonics.join(' '));

        const child1Mnemonics_2 = await getChildMnemonics(seed, 'invoice_#1');
        expect(child1Mnemonics_2.join(' ')).toBe(child1Mnemonics.join(' '));
    });
});
