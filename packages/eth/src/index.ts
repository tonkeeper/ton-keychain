import { getNthAccountTon } from '@ton-keychain/core';
import { KeychainEthAccountsProvider } from './keychain-eth-accounts-provider';
import { KeychainEthAccount } from './keychain-eth-account';

export { KeychainEthAccountsProvider } from './keychain-eth-accounts-provider';
export { KeychainEthAccount } from './keychain-eth-account';

export async function getNthAccountEth(
    rootMnemonic: string[],
    childIndex: number
): Promise<KeychainEthAccount> {
    const tonAccount = await getNthAccountTon(rootMnemonic, childIndex);
    const ethProvider = KeychainEthAccountsProvider.fromEntropy(tonAccount.entropy);
    return ethProvider.getAccount();
}
