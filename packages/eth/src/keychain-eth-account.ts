import { ethers } from 'ethers';

export class KeychainEthAccount {
    get privateKey(): string {
        return this.hdAccount.privateKey;
    }

    get publicKey(): string {
        return this.hdAccount.publicKey;
    }

    get address(): string {
        return this.hdAccount.address;
    }

    constructor(readonly hdAccount: ethers.HDNodeWallet) {}
}
