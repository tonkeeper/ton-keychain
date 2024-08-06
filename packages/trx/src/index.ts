import { getNthAccountTon } from '@multi-account-mnemonic/core';
import { MamTrxAccount } from './mam-trx-account';
import { MamTrxAccountsProvider } from './mam-trx-accounts-provider';

export { MamTrxAccountsProvider } from './mam-trx-accounts-provider';
export { MamTrxAccount } from './mam-trx-account';

export async function getNthAccountTrx(
    rootMnemonic: string[],
    childIndex: number
): Promise<MamTrxAccount> {
    const tonAccount = await getNthAccountTon(rootMnemonic, childIndex);
    const trxProvider = MamTrxAccountsProvider.fromEntropy(tonAccount.entropy);
    return trxProvider.getAccount();
}
