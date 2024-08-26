import { describe, it, expect } from 'vitest';
import { getNthAccountEth } from '../src';
import { TonKeychainRoot } from '@ton-keychain/core';

describe('Eth plugin tests', () => {
    it('Calculations are determined', async () => {
        const rootAccount = await TonKeychainRoot.generate();
        const acc0 = await getNthAccountEth(rootAccount.mnemonic, 0);
        await getNthAccountEth(rootAccount.mnemonic, 1);
        const acc0_2 = await getNthAccountEth(rootAccount.mnemonic, 0);

        expect(acc0.address).toBe(acc0_2.address);
    });
});
