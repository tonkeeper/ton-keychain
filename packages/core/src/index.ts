import { TonKeychainRoot } from './ton-keychain-root';
import { KeychainTonAccount } from './keychain-ton-account';
export { TonKeychainRoot } from './ton-keychain-root';
export { KeychainTonAccount } from './keychain-ton-account';

export async function getNthAccountTon(
    rootMnemonic: string[],
    childIndex: number
): Promise<KeychainTonAccount> {
    const root = await TonKeychainRoot.fromMnemonic(rootMnemonic);
    return root.getTonAccount(childIndex);
}
