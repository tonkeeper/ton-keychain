import { Account } from '../account';
import { BIP32Interface } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';

export class BtcAccount extends Account {
    public readonly address: string;

    public readonly publicKey: string;

    public readonly privateKey: string;

    constructor(
        public readonly mnemonics: string[],
        public readonly bip32Account: BIP32Interface,
        addressType: 'legacy' | 'segwit' = 'legacy'
    ) {
        super();
        this.publicKey = '0x' + bip32Account.publicKey.toString('hex');
        this.privateKey = '0x' + bip32Account.privateKey!.toString('hex');
        this.address =
            addressType === 'legacy'
                ? bitcoin.payments.p2pkh({ pubkey: bip32Account.publicKey }).address!
                : bitcoin.payments.p2wpkh({ pubkey: bip32Account.publicKey }).address!;
    }
}
