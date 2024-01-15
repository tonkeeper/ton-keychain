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

    const ethProvider = EthAccountsProvider.fromEntropy(entropy);
    const ethAccount = ethProvider.getAccount();

    console.log(`Eth account`);
    console.log('Address: ', ethAccount.address);
    console.log(ethProvider.mnemonics.join(' '));
    console.log('Private key:', ethAccount.privateKey);
    console.log('Public key:', ethAccount.publicKey);
    console.log('-----------------------------------------------------\n');

    const trxProvider = TrxAccountsProvider.fromEntropy(entropy);
    const trxAccount = trxProvider.getAccount();

    console.log(`Trx account`);
    console.log('Address: ', trxAccount.address);
    console.log(trxProvider.mnemonics.join(' '));
    console.log('Private key:', trxAccount.privateKey);
    console.log('Public key:', trxAccount.publicKey);
    console.log('-----------------------------------------------------\n');

    const btcProvider = BtcAccountsProvider.fromEntropy(entropy);
    console.log('Btc mnemonics: ', btcProvider.mnemonics.join(' '));
    const btcAccount = btcProvider.getAccount(0);

    for (let i = 0; i < Number(options.btcaccs); i++) {
        const btcRecipient = btcAccount.getRecipient();
        console.log(`Btc address #${i}`);
        console.log('Address legacy: ', btcRecipient.legacyAddress);
        console.log('Address segwit: ', btcRecipient.segwitAddress);
        console.log('Private key: ', btcRecipient.privateKey);
        console.log('Public key: ', btcRecipient.publicKey);
        console.log('--\n');
    }
}
