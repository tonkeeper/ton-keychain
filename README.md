# Generate ton, eth, trx, btc accounts from ton mnemonics

[Specification](SPECIFICATION.md)

## Getting started
- `npm i`
- `npm run build`

## Usage
`node . [options] '<SPACE SEPARATED MNEMONICS>'`

### Arguments:
- mnemonics: 24 words ton root mnemonics

### Options:
- -V, --version            output the version number
- -t, --tonaccs <tonaccs>  Number of the ton accounts to generate (default: "5")
- -b, --btcaccs <btcaccs>  Number of the btc addresses to generate (default: "5")
- -h, --help               display help for command

## Run tests
- `npm run test`
