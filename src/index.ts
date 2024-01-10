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
    .option('-s, --segwit', 'Use segwit address type instead of legacy')
    .action(main);

program.parse();

async function main(
    mnemonics: string,
    options: { tonaccs: string; btcaccs: string; segwit: boolean }
) {
    const mnemonicsArr = mnemonics.split(' ').filter(Boolean);
    if (mnemonicsArr.length !== 24) {
        throw new Error('Wrong mnemonics format: should be 24 words separated by spaces');
    }
    const tonAccountsNumber = Number(options.tonaccs);
    const entropy = await mnemonicToEntropy(mnemonicsArr);
    const tonAccountsProvider = await TonAccountsProvider.fromMnemonics(mnemonicsArr);

    console.log('Ton root account');
    console.log(
        `Address w4: ${tonAccountsProvider.rootAccount.address.toString({ bounceable: false })}`
    );
    console.log(tonAccountsProvider.rootAccount.mnemonics.join(' '));
    console.log('Private key:', tonAccountsProvider.rootAccount.privateKey);
    console.log('Public key:', tonAccountsProvider.rootAccount.publicKey);
    const children = await Promise.all(
        [...new Array(tonAccountsNumber)].map((_, i) =>
            tonAccountsProvider.generateChildAccount(i.toString())
        )
    );

    children.forEach((tonAcc, index) => {
        console.log('--\n');
        console.log(`Ton child account #${index + 1}`);
        console.log(`Address w4: ${tonAcc.address.toString({ bounceable: false })}`);
        console.log(tonAcc.mnemonics.join(' '));
        console.log('Private key:', tonAcc.privateKey);
        console.log('Public key:', tonAcc.publicKey);
    });

    console.log('\n-----------------------------------------------------\n');

    const ethProvider = await EthAccountsProvider.fromEntropy(entropy);
    const ethAcc = ethProvider.rootAccount;

    console.log(`Eth account`);
    console.log('Address: ', ethAcc.address);
    console.log(ethAcc.mnemonics.join(' '));
    console.log('Private key:', ethAcc.privateKey);
    console.log('Public key:', ethAcc.publicKey);
    console.log('-----------------------------------------------------\n');

    const trxProvider = await TrxAccountsProvider.fromEntropy(entropy);
    const trxAccount = trxProvider.rootAccount;

    console.log(`Trx account`);
    console.log('Address: ', trxAccount.address);
    console.log(trxAccount.mnemonics.join(' '));
    console.log('Private key:', trxAccount.privateKey);
    console.log('Public key:', trxAccount.publicKey);
    console.log('-----------------------------------------------------\n');

    const addressType = options.segwit ? 'segwit' : 'legacy';
    const btcProvider = await BtcAccountsProvider.fromEntropy(entropy, addressType);
    const btcAccount = btcProvider.rootAccount;

    console.log(`Btc root account`);
    console.log(btcAccount.address);
    console.log(btcAccount.mnemonics.join(' '));
    console.log('Private key:', btcAccount.privateKey);
    console.log('Public key:', btcAccount.publicKey);
    console.log('--');

    for (let i = 0; i < Number(options.btcaccs); i++) {
        const btcAcc = btcProvider.generateChildAccount(0, i, addressType);
        console.log(`Btc address #${i + 1}`);
        console.log(btcAcc.address);
        console.log('--\n');
    }
}
