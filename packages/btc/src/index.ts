import { getNthAccountTon } from '@multi-account-mnemonic/core';
import { MamBtcAccountsProvider } from './mam-btc-accounts-provider';

export { MamBtcAccountsProvider } from './mam-btc-accounts-provider';
export { MamBtcAccount, MamBtcRecipient } from './mam-btc-account';

export async function getNthAccountBtcProvider(
    rootMnemonic: string[],
    childIndex: number
): Promise<MamBtcAccountsProvider> {
    const tonAccount = await getNthAccountTon(rootMnemonic, childIndex);
    return MamBtcAccountsProvider.fromEntropy(tonAccount.entropy);
}
