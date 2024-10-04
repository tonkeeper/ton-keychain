import { getNthAccountTon, TonKeychainRoot } from '../src';
import { describe, it, expect } from 'vitest';
import { mnemonicValidate } from '@ton/crypto';

describe('Multi accounts mnemonic tests', () => {
    it('Calculations are determined', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const rootAccountClone = await TonKeychainRoot.fromMnemonic(rootAccount.mnemonic);

        expect(rootAccount.id).toBeTruthy();
        expect(rootAccount.id).toBe(rootAccountClone.id);
    });

    it('Calculations for ton are determined', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const rootAccountClone = await TonKeychainRoot.fromMnemonic(rootAccount.mnemonic);
        const tonAccount = await rootAccount.getTonAccount(123);
        const tonAccountRedundant = await rootAccountClone.getTonAccount(11);
        const tonAccountClone = await rootAccountClone.getTonAccount(123);

        expect(tonAccount.privateKey).toBe(tonAccountClone.privateKey);
        expect(tonAccount.privateKey).not.toBe(tonAccountRedundant.privateKey);
    });

    it('Calculations for ton are determined for one root account', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const tonAccount1 = await rootAccount.getTonAccount(123);
        const tonAccount2 = await rootAccount.getTonAccount(239);
        const tonAccount1_clone = await rootAccount.getTonAccount(123);

        expect(tonAccount1.mnemonics).toEqual(tonAccount1_clone.mnemonics);
        expect(tonAccount1.mnemonics).not.toBe(tonAccount2.mnemonics);
    });

    it('Should generate a valid ton mnemonics', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const tonAccount = await rootAccount.getTonAccount(239);

        const isValidMnemonic = await mnemonicValidate(tonAccount.mnemonics);
        expect(isValidMnemonic).toBeTruthy();
    });

    it('Should get nth ton account', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const tonAccount = await rootAccount.getTonAccount(239);

        const tonAccountClone = await getNthAccountTon(rootAccount.mnemonic, 239);

        expect(tonAccount.mnemonics).toEqual(tonAccountClone.mnemonics);
        expect(await mnemonicValidate(tonAccountClone.mnemonics)).toBeTruthy();
    });

    it('Root acc ID should start with TK', async () => {
        const rootAccount = await TonKeychainRoot.generate();

        expect(rootAccount.id.startsWith('TK')).toBeTruthy();
    });

    it('Should generate different root accounts', async () => {
        const rootAccount1 = await TonKeychainRoot.generate();
        const rootAccount2 = await TonKeychainRoot.generate();

        expect(rootAccount1.id).not.toBe(rootAccount2.id);
        expect(rootAccount1.mnemonic).not.toEqual(rootAccount2.mnemonic);
    });

    it('Should calculate sub root accounts', async () => {
        const rootAccount1 = await TonKeychainRoot.generate();
        const rootAccount2 = await TonKeychainRoot.generate();

        const subRoot1_1 = await rootAccount1.getSubRootAccount(1);
        const subRoot1_2 = await rootAccount1.getSubRootAccount(2);
        const subRoot2_1 = await rootAccount2.getSubRootAccount(1);
        const subRoot2_2 = await rootAccount2.getSubRootAccount(2);

        expect(await TonKeychainRoot.isValidMnemonic(subRoot1_1.mnemonic)).toBeTruthy();
        expect(await TonKeychainRoot.isValidMnemonic(subRoot1_2.mnemonic)).toBeTruthy();
        expect(await TonKeychainRoot.isValidMnemonic(subRoot2_1.mnemonic)).toBeTruthy();
        expect(await TonKeychainRoot.isValidMnemonic(subRoot2_2.mnemonic)).toBeTruthy();

        const mnemonics = new Set([
            rootAccount1.mnemonic.join(' '),
            rootAccount2.mnemonic.join(' '),
            subRoot1_1.mnemonic.join(' '),
            subRoot1_2.mnemonic.join(' '),
            subRoot2_1.mnemonic.join(' '),
            subRoot2_2.mnemonic.join(' ')
        ]);

        expect(mnemonics.size).toBe(6);
    });

    it('Sub root accounts calculations are determined', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const subRoot1 = await rootAccount.getSubRootAccount(30);
        const subRoot2 = await rootAccount.getSubRootAccount(239);
        const subRoot3 = await rootAccount.getSubRootAccount(366);

        const rootAccount_clone = await TonKeychainRoot.fromMnemonic(rootAccount.mnemonic);
        const subRoot2_clone = await rootAccount_clone.getSubRootAccount(239);
        const subRoot1_clone = await rootAccount_clone.getSubRootAccount(30);
        const subRoot3_clone = await rootAccount_clone.getSubRootAccount(366);

        expect(subRoot1.mnemonic).toEqual(subRoot1_clone.mnemonic);
        expect(subRoot2.mnemonic).toEqual(subRoot2_clone.mnemonic);
        expect(subRoot3.mnemonic).toEqual(subRoot3_clone.mnemonic);
    });

    it('Mnemonic should not be compatible with TON', async () => {
        const bothCompatibleLegacyMnemonic =
            'machine element second curtain pizza ocean era relief flavor alpha kitchen student cat raccoon gown gather lion fuel census avoid inform obtain melody present'.split(
                ' '
            );

        const isTonCompatible = await mnemonicValidate(bothCompatibleLegacyMnemonic);
        const isLegacyCompatible = await TonKeychainRoot.isValidMnemonicLegacy(
            bothCompatibleLegacyMnemonic
        );

        expect(isTonCompatible).toBeTruthy();
        expect(isLegacyCompatible).toBeTruthy();

        const isKeychainValid = await TonKeychainRoot.isValidMnemonic(bothCompatibleLegacyMnemonic);

        expect(isKeychainValid).toBeFalsy();
    });

    it("Can't create root account from legacy mnemonic unless flag is passed", async () => {
        const bothCompatibleLegacyMnemonic =
            'machine element second curtain pizza ocean era relief flavor alpha kitchen student cat raccoon gown gather lion fuel census avoid inform obtain melody present'.split(
                ' '
            );

        await expect(() =>
            TonKeychainRoot.fromMnemonic(bothCompatibleLegacyMnemonic)
        ).rejects.toThrowError('Mnemonic is not compatible with Tonkeeper Root account recovery');

        const account = await TonKeychainRoot.fromMnemonic(bothCompatibleLegacyMnemonic, {
            allowLegacyMnemonic: true
        });

        expect(account.mnemonic).toBe(bothCompatibleLegacyMnemonic);
    });
});
