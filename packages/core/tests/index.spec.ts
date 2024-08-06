// import { getNthAccountEth } from '../src';
import { MamRoot } from '../src';
import { describe, it, expect } from 'vitest';

describe('Multi accounts mnemonic tests', () => {
    it('Calculations are determined', async () => {
        const rootAccount = await MamRoot.generate();
        const rootAccountClone = await MamRoot.fromMnemonic(rootAccount.mnemonic);

        expect(rootAccount.id).toBeTruthy();
        expect(rootAccount.id).toBe(rootAccountClone.id);
    });
});
