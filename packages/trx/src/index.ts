import { getNthAccountTon } from '@ton-keychain/core';
import { KeychainTrxAccount } from './keychain-trx-account';
import { KeychainTrxAccountsProvider } from './keychain-trx-accounts-provider';

export { KeychainTrxAccountsProvider } from './keychain-trx-accounts-provider';
export { KeychainTrxAccount } from './keychain-trx-account';

export async function getNthAccountTrx(
    rootMnemonic: string[],
    childIndex: number
): Promise<KeychainTrxAccount> {
    const tonAccount = await getNthAccountTon(rootMnemonic, childIndex);
    const trxProvider = KeychainTrxAccountsProvider.fromEntropy(tonAccount.entropy);
    return trxProvider.getAccount();
}
