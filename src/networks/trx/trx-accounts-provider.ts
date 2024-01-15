import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { TrxAccount } from './trx-account';
import { ethers } from 'ethers';

export class TrxAccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly BASE_DERIVATION_PATH = "m/44'/195'/0'/0" as const;

    private static readonly NETWORK_LABEL = 'trx-0x2b6653dc_root';

    static fromEntropy(entropy: Buffer): TrxAccountsProvider {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const hdAccount = ethers.HDNodeWallet.fromPhrase(
            mnemonics,
            undefined,
            this.BASE_DERIVATION_PATH
        );

        return new TrxAccountsProvider(mnemonics.split(' '), hdAccount);
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (TrxAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - TrxAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    public getAccount(index: number = 0): TrxAccount {
        return new TrxAccount(this.hdAccount.deriveChild(index));
    }

    private constructor(readonly mnemonics: string[], readonly hdAccount: ethers.HDNodeWallet) {}
}
