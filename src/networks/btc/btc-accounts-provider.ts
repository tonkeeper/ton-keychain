import { AccountsProvider } from '../accounts-provider';
import { entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { BtcAccount } from './btc-account';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory, { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

export class BtcAccountsProvider extends AccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly DERIVATION_PATH = "m/44'/0'/0'" as const;

    private static readonly NETWORK_LABEL = 'btc_root';

    static async fromEntropy(
        entropy: Buffer,
        addressType: 'legacy' | 'segwit' = 'legacy'
    ): Promise<BtcAccountsProvider> {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const seed = mnemonicToSeedSync(mnemonics);
        const root = bip32.fromSeed(Buffer.from(seed), bitcoin.networks.bitcoin);

        const account = root.derivePath(this.DERIVATION_PATH);

        return new BtcAccountsProvider(mnemonics, account, addressType);
    }

    public readonly rootAccount: BtcAccount;

    public generateChildAccount(
        account: number,
        index: number,
        addressType: 'legacy' | 'segwit' = 'legacy'
    ): BtcAccount {
        const childNode = this.rootNode.derive(account).derive(index);
        return new BtcAccount(this.rootAccount.mnemonics, childNode, addressType);
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (BtcAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - BtcAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    private constructor(
        mnemonics: string,
        private readonly rootNode: BIP32Interface,
        addressType: 'legacy' | 'segwit' = 'legacy'
    ) {
        super();
        this.rootAccount = new BtcAccount(
            mnemonics.split(' '),
            rootNode.derive(0).derive(0),
            addressType
        );
    }
}
