import { Account } from './account';

export abstract class AccountsProvider {
    abstract rootAccount: Account;
}
