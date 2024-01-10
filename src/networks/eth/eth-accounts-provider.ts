import { AccountsProvider } from '../accounts-provider';
import { EthAccount } from './eth-account';
import { mnemonicToAccount } from 'viem/accounts';
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';

export class EthAccountsProvider extends AccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly DERIVATION_PATH = "m/44'/60'/0'" as const;

    private static readonly NETWORK_LABEL = 'eth-0x1_root';

    static async fromEntropy(entropy: Buffer): Promise<EthAccountsProvider> {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const hdAccount = mnemonicToAccount(mnemonics, { path: this.getDerivationPath(0) });
        const ethAccount = new EthAccount(mnemonics.split(' '), hdAccount);
        return new EthAccountsProvider(ethAccount);
    }

    private static getDerivationPath(index: number): `m/44'/60'/0'/${number}` {
        return `${this.DERIVATION_PATH}/${index}`;
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (EthAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - EthAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    private constructor(public readonly rootAccount: EthAccount) {
        super();
    }
}
