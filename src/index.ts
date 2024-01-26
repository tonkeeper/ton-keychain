import { EthAccountsProvider } from './networks/eth/eth-accounts-provider';
import { TrxAccountsProvider } from './networks/trx/trx-accounts-provider';
import { Command } from 'commander';
import { BtcAccountsProvider } from './networks/btc/btc-accounts-provider';
import { RootAccount } from './root-account';
import { TonAccount } from './networks/ton/ton-account';

const program = new Command();
program
    .name('tonkeeper-address-generator')
    .description('Generate ton, eth, trx, btc accounts from ton mnemonics')
    .version('0.0.2')
    .option('-m, --mnemonic <mnemonic>', '24 words ton root mnemonics')
    .option('-a, --accs <tonaccs>', 'Number of the accounts to generate', '5')
    .option('-b, --btcaddrs <btcaccs>', 'Number of the btc addresses to generate', '2')
    .action(main);

program.parse();

async function main(options: { accs: string; btcaddrs: string; mnemonic: string }) {
    let rootAccount: RootAccount;
    if (options.mnemonic) {
        const mnemonic = options.mnemonic.split(' ');
        if (mnemonic.length !== 24) {
            throw new Error('Wrong mnemonics format: should be 24 words separated by spaces');
        }
        rootAccount = await RootAccount.fromMnemonic(mnemonic);
    } else {
        rootAccount = await RootAccount.generate();
    }

    console.log('ROOT ACC');
    console.log(rootAccount.mnemonic.join(' '));
    console.log('ID: ', rootAccount.id);
    console.log('—————————————————————————————————————————————\n');

    const accountsNumber = Number(options.accs);
    const childTonAccs = await Promise.all(
        [...new Array(accountsNumber)].map(rootAccount.getTonAccount)
    );
    childTonAccs.forEach((acc, index) => {
        console.log(`Ton Account #${index}`);
        generateAllChainAccsByTonAcc(acc, { btcaddrs: Number(options.btcaddrs) });
        console.log('----------------------------------------------------------------------------');
    });
}
function generateAllChainAccsByTonAcc(tonAccount: TonAccount, options: { btcaddrs: number }) {
    const entropy = tonAccount.entropy;
    console.log(`Address w4: ${tonAccount.address.toString({ bounceable: false })}`);
    console.log(tonAccount.mnemonics.join(' '));
    console.log('Private key:', tonAccount.privateKey);
    console.log('Public key:', tonAccount.publicKey);

    console.log('\n------\n');

    const ethProvider = EthAccountsProvider.fromEntropy(entropy);
    const ethAccount = ethProvider.getAccount();

    console.log(`Eth account`);
    console.log('Address: ', ethAccount.address);
    console.log(ethProvider.mnemonics.join(' '));
    console.log('Private key:', ethAccount.privateKey);
    console.log('Public key:', ethAccount.publicKey);
    console.log('------\n');

    const trxProvider = TrxAccountsProvider.fromEntropy(entropy);
    const trxAccount = trxProvider.getAccount();

    console.log(`Trx account`);
    console.log('Address: ', trxAccount.address);
    console.log(trxProvider.mnemonics.join(' '));
    console.log('Private key:', trxAccount.privateKey);
    console.log('Public key:', trxAccount.publicKey);
    console.log('------\n');

    const btcProvider = BtcAccountsProvider.fromEntropy(entropy);
    console.log('Btc mnemonics: ', btcProvider.mnemonics.join(' '));
    const btcAccount = btcProvider.getAccount(0);

    for (let i = 0; i < options.btcaddrs; i++) {
        const btcRecipient = btcAccount.getRecipient();
        console.log(`Btc address #${i}`);
        console.log('Address legacy: ', btcRecipient.legacyAddress);
        console.log('Address segwit: ', btcRecipient.segwitAddress);
        console.log('Private key: ', btcRecipient.privateKey);
        console.log('Public key: ', btcRecipient.publicKey);
        console.log('--\n');
    }
}
