import { entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { KeychainBtcAccount } from './keychain-btc-account';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory, { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

export class KeychainBtcAccountsProvider {
    static MNEMONICS_WORDS_NUMBER = 12;

    private static CHECKSUM_BITS = 4;

    private static readonly BASE_DERIVATION_PATH = "m/84'/0'" as const;

    private static readonly NETWORK_LABEL = 'btc_root';

    static fromEntropy(entropy: Buffer): KeychainBtcAccountsProvider {
        const networkEntropy = this.patchEntropy(entropy);
        const mnemonics = entropyToMnemonic(networkEntropy, wordlist);
        const seed = mnemonicToSeedSync(mnemonics);
        const root = bip32
            .fromSeed(Buffer.from(seed), bitcoin.networks.bitcoin)
            .derivePath(this.BASE_DERIVATION_PATH);

        return new KeychainBtcAccountsProvider(mnemonics.split(' '), root);
    }

    private static patchEntropy(seed: Buffer): Uint8Array {
        return hmac(sha256, this.NETWORK_LABEL, seed).subarray(
            0,
            (KeychainBtcAccountsProvider.MNEMONICS_WORDS_NUMBER * 11 - KeychainBtcAccountsProvider.CHECKSUM_BITS) /
                8
        );
    }

    public getAccount(account: number): KeychainBtcAccount {
        const childNode = this.rootBip32Node.deriveHardened(account).derive(0);
        return new KeychainBtcAccount(childNode);
    }

    private constructor(readonly mnemonics: string[], readonly rootBip32Node: BIP32Interface) {}
}
