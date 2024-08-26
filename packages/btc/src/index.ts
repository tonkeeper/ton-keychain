import { getNthAccountTon } from '@ton-keychain/core';
import { KeychainBtcAccountsProvider } from './keychain-btc-accounts-provider';

export { KeychainBtcAccountsProvider } from './keychain-btc-accounts-provider';
export { KeychainBtcAccount, KeychainBtcRecipient } from './keychain-btc-account';

export async function getNthAccountBtcProvider(
    rootMnemonic: string[],
    childIndex: number
): Promise<KeychainBtcAccountsProvider> {
    const tonAccount = await getNthAccountTon(rootMnemonic, childIndex);
    return KeychainBtcAccountsProvider.fromEntropy(tonAccount.entropy);
}
