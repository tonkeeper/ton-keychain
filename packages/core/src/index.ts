import { MamRoot } from './mam-root';
import { MamTonAccount } from './mam-ton-account';
export { MamRoot } from './mam-root';
export { MamTonAccount } from './mam-ton-account';

export async function getNthAccountTon(
    rootMnemonic: string[],
    childIndex: number
): Promise<MamTonAccount> {
    const root = await MamRoot.fromMnemonic(rootMnemonic);
    return root.getTonAccount(childIndex);
}
