import { getNthAccountTon } from '@multi-account-mnemonic/core';
import { MamEthAccountsProvider } from './mam-eth-accounts-provider';
import { MamEthAccount } from './mam-eth-account';

export { MamEthAccountsProvider } from './mam-eth-accounts-provider';
export { MamEthAccount } from './mam-eth-account';

export async function getNthAccountEth(
    rootMnemonic: string[],
    childIndex: number
): Promise<MamEthAccount> {
    const tonAccount = await getNthAccountTon(rootMnemonic, childIndex);
    const ethProvider = MamEthAccountsProvider.fromEntropy(tonAccount.entropy);
    return ethProvider.getAccount();
}
