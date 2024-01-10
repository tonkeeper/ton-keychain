import { AccountsProvider } from '../accounts-provider';
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { TrxAccount } from './trx-account';
import { ethers } from 'ethers';

export class TrxAccountsProvider extends AccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly DERIVATION_PATH = "m/44'/195'/0'" as const;

    private static readonly NETWORK_LABEL = 'trx-0x2b6653dc_root';

    static async fromEntropy(entropy: Buffer): Promise<TrxAccountsProvider> {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const hdAccount = ethers.HDNodeWallet.fromPhrase(mnemonics).derivePath(
            this.getDerivationPath(0)
        );
        const trxAccount = new TrxAccount(mnemonics.split(' '), hdAccount);
        return new TrxAccountsProvider(trxAccount);
    }

    private static getDerivationPath(index: number): `m/44'/195'/0'/${number}` {
        return `${this.DERIVATION_PATH}/${index}`;
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (TrxAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - TrxAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    private constructor(public readonly rootAccount: TrxAccount) {
        super();
    }
}
