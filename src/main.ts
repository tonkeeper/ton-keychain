import { mnemonicToEntropy } from '@ton/crypto/dist/mnemonic/mnemonic';
import { TonAccountsProvider } from './networks/ton/ton-accounts-provider';
import { EthAccountsProvider } from './networks/eth/eth-accounts-provider';
import { TrxAccountsProvider } from './networks/trx/trx-accounts-provider';
import { Command } from 'commander';
import { BtcAccountsProvider } from './networks/btc/btc-accounts-provider';

const program = new Command();
program
    .name('tonkeeper-address-generator')
    .description('Generate ton, eth, trx, btc accounts from ton mnemonics')
    .version('0.0.1')
    .argument('<mnemonics>', '24 words ton root mnemonics')
    .option('-t, --tonaccs <tonaccs>', 'Number of the ton accounts to generate', '5')
    .option('-b, --btcaccs <btcaccs>', 'Number of the btc addresses to generate', '5')
    .action(main);

program.parse();

async function main(mnemonics: string, options: { tonaccs: string; btcaccs: string }) {
    const tonAccountsNumber = Number(options.tonaccs);
    const entropy = await mnemonicToEntropy(mnemonics.split(' '));
    const tonAccountsProvider = await TonAccountsProvider.fromMnemonics(mnemonics.split(' '));

    console.log(`Ton root account`);
    console.log(
        tonAccountsProvider.rootAccount.mnemonics.join(' '),
        '\n',
        'Private key:',
        tonAccountsProvider.rootAccount.privateKey
    );
    const children = await Promise.all(
        [...new Array(tonAccountsNumber)].map((_, i) =>
            tonAccountsProvider.generateChildAccount(i.toString())
        )
    );

    children.forEach((tonAcc, index) => {
        console.log('--\n');
        console.log(`Ton child account #${index + 1}`);
        console.log(tonAcc.mnemonics.join(' '), '\n', 'Private key:', tonAcc.privateKey);
    });

    console.log('\n-----------------------------------------------------\n');

    const ethProvider = await EthAccountsProvider.fromEntropy(entropy);
    const ethAcc = ethProvider.rootAccount;

    console.log(`Eth account`);
    console.log('Address: ', ethAcc.address, '\n');
    console.log(ethAcc.mnemonics.join(' '), '\n', 'Private key:', ethAcc.privateKey);
    console.log('-----------------------------------------------------\n');

    const trxProvider = await TrxAccountsProvider.fromEntropy(entropy);
    const trxAccount = trxProvider.rootAccount;

    console.log(`Trx account`);
    console.log('Address: ', trxAccount.address, '\n');
    console.log(trxAccount.mnemonics.join(' '), '\n', 'Private key:', trxAccount.privateKey);
    console.log('-----------------------------------------------------\n');

    const btcProvider = await BtcAccountsProvider.fromEntropy(entropy);
    const btcAccount = btcProvider.rootAccount;

    console.log(`Btc root account`);
    console.log(btcAccount.address, '\n');
    console.log(btcAccount.mnemonics.join(' '), '\n', 'Private key:',  btcAccount.privateKey);
    console.log('--');

    for (let i = 0; i < Number(options.btcaccs); i++) {
        const btcAcc = btcProvider.generateChildAccount(0, i);
        console.log(`Btc address #${i + 1}`);
        console.log(btcAcc.address, '\n');
        console.log('--\n');
    }
}
