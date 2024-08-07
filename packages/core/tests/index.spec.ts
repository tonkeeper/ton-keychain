import { getNthAccountTon, MamRoot } from '../src';
import { describe, it, expect } from 'vitest';
import { mnemonicValidate } from '@ton/crypto';

describe('Multi accounts mnemonic tests', () => {
    it('Calculations are determined', async () => {
        const rootAccount = await MamRoot.generate();
        const rootAccountClone = await MamRoot.fromMnemonic(rootAccount.mnemonic);

        expect(rootAccount.id).toBeTruthy();
        expect(rootAccount.id).toBe(rootAccountClone.id);
    });

    it('Calculations for ton are determined', async () => {
        const rootAccount = await MamRoot.generate();
        const rootAccountClone = await MamRoot.fromMnemonic(rootAccount.mnemonic);
        const tonAccount = await rootAccount.getTonAccount(123);
        const tonAccountRedundant = await rootAccountClone.getTonAccount(11);
        const tonAccountClone = await rootAccountClone.getTonAccount(123);

        expect(tonAccount.privateKey).toBe(tonAccountClone.privateKey);
        expect(tonAccount.privateKey).not.toBe(tonAccountRedundant.privateKey);
    });

    it('Calculations for ton are determined for one root account', async () => {
        const rootAccount = await MamRoot.generate();
        const tonAccount1 = await rootAccount.getTonAccount(123);
        const tonAccount2 = await rootAccount.getTonAccount(239);
        const tonAccount1_clone = await rootAccount.getTonAccount(123);

        expect(tonAccount1.mnemonics).toEqual(tonAccount1_clone.mnemonics);
        expect(tonAccount1.mnemonics).not.toBe(tonAccount2.mnemonics);
    });

    it('Should generate a valid ton mnemonics', async () => {
        const rootAccount = await MamRoot.generate();
        const tonAccount = await rootAccount.getTonAccount(239);

        const isValidMnemonic = await mnemonicValidate(tonAccount.mnemonics);
        expect(isValidMnemonic).toBeTruthy();
    });

    it('Should get nth ton account', async () => {
        const rootAccount = await MamRoot.generate();
        const tonAccount = await rootAccount.getTonAccount(239);

        const tonAccountClone = await getNthAccountTon(rootAccount.mnemonic, 239);

        expect(tonAccount.mnemonics).toEqual(tonAccountClone.mnemonics);
    });

    it('Root acc ID should start with MAM', async () => {
        const rootAccount = await MamRoot.generate();

        expect(rootAccount.id.startsWith('MA')).toBeTruthy();
    });

    it('Should generate different root accounts', async () => {
        const rootAccount1 = await MamRoot.generate();
        const rootAccount2 = await MamRoot.generate();

        expect(rootAccount1.id).not.toBe(rootAccount2.id);
        expect(rootAccount1.mnemonic).not.toEqual(rootAccount2.mnemonic);
    });
});
