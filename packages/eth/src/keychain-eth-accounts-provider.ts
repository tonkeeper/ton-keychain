import { KeychainEthAccount } from './keychain-eth-account';
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { ethers } from 'ethers';

export class KeychainEthAccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly BASE_DERIVATION_PATH = "m/44'/60'/0'/0" as const;

    private static readonly NETWORK_LABEL = 'eth-0x1_root';

    static fromEntropy(entropy: Buffer): KeychainEthAccountsProvider {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const hdAccount = ethers.HDNodeWallet.fromPhrase(
            mnemonics,
            undefined,
            this.BASE_DERIVATION_PATH
        );

        return new KeychainEthAccountsProvider(mnemonics.split(' '), hdAccount);
    }

    getAccount(index: number = 0): KeychainEthAccount {
        return new KeychainEthAccount(this.hdAccount.deriveChild(index));
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (KeychainEthAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - KeychainEthAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    private constructor(readonly mnemonics: string[], readonly hdAccount: ethers.HDNodeWallet) {}
}
