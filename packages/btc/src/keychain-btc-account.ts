import { BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';

export class KeychainBtcRecipient {
    get publicKey(): string {
        return '0x' + this.bip32Node.publicKey.toString('hex');
    }

    get privateKey(): string {
        return '0x' + this.bip32Node.privateKey!.toString('hex');
    }

    readonly legacyAddress: string;

    readonly segwitAddress: string;

    constructor(readonly bip32Node: BIP32Interface) {
        this.legacyAddress = bitcoin.payments.p2pkh({ pubkey: bip32Node.publicKey }).address!;
        this.segwitAddress = bitcoin.payments.p2wpkh({ pubkey: bip32Node.publicKey }).address!;
    }
}

export class KeychainBtcAccount {
    latestAccountIndex = 0;

    constructor(readonly bip32Node: BIP32Interface) {}

    public getRecipient(index?: number): KeychainBtcRecipient {
        if (index === undefined) {
            index = this.latestAccountIndex;
            this.latestAccountIndex++;
        }

        return new KeychainBtcRecipient(this.bip32Node.derive(index));
    }
}
