import { EthAccount } from './eth-account';
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { ethers } from 'ethers';

export class EthAccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly BASE_DERIVATION_PATH = "m/44'/60'/0'/0" as const;

    private static readonly NETWORK_LABEL = 'eth-0x1_root';

    static fromEntropy(entropy: Buffer): EthAccountsProvider {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const hdAccount = ethers.HDNodeWallet.fromPhrase(
            mnemonics,
            undefined,
            this.BASE_DERIVATION_PATH
        );

        return new EthAccountsProvider(mnemonics.split(' '), hdAccount);
    }

    getAccount(index: number = 0): EthAccount {
        return new EthAccount(this.hdAccount.deriveChild(index));
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (EthAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - EthAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    private constructor(readonly mnemonics: string[], readonly hdAccount: ethers.HDNodeWallet) {}
}
