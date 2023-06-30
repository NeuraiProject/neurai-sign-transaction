# neurai-sign-transaction

Signs a Neurai transaction

The sole purpose of this project is to enable us to
"Sign XNA or asset transfer transactions in pure JavaScript"

## Working proof of concept.

We are able to sign Neurai asset transfers using bitcoinjs-lib version 5.2 with a patched
Transaction Builder.

## How to use

The sign method has four arguments
1) The network "string", can be "xna" | "xna-test" | "evr" | "evr-test",
2) The raw transaction (in hex)
3) An array of UTXO objects to use
4) Private keys. An object with "address" as key and "WIF" as value

returns a signed transaction (hex), after that it is up to you to publish it on the network
```
import Signer from "@neuraiproject/neurai-sign-transaction";

const raw =
  "0200000002fe6cfe20184b592849231eea8167e3de073b6ec1b8218c2ef36838a4e07dd11c0200000000ffffffff28c32b825b14251708ea39c0ac706bd3d933778d7838d01b678b045a48e219950000000000ffffffff0200000000000000003a76a91416014dfb02a07417cbf8c0366ee5ae0a29d5878f88acc01e72766e74114652454e2f59554c45544944453230323100e1f5050000000075000e2707000000001976a914c6a0e8557c7567a4d9cc84574c34fbb62ece3c9688ac00000000";
const UTXOs = [
  {
    address: "RTPSdYw3iB93L6Hb9xWd1ixVxPYu1QePdi",
    assetName: "XNA",
    txid: "1cd17de0a43868f32e8c21b8c16e3b07dee36781ea1e234928594b1820fe6cfe",
    outputIndex: 2,
    script: "76a914c6a0e8557c7567a4d9cc84574c34fbb62ece3c9688ac",
    satoshis: 122000000,
    height: 2670673,
  },
  {
    address: "RSuQSgXXr1z4gKommSqhHLffiNxnSE3Bwn",
    assetName: "FREN/YULETIDE2021",
    txid: "9519e2485a048b671bd038788d7733d9d36b70acc039ea081725145b822bc328",
    outputIndex: 0,
    script:
      "76a914c1536f46fa2fa04be210406529be283c1c85e4ce88acc01e72766e74114652454e2f59554c45544944453230323100e1f5050000000075",
    satoshis: 100000000,
    height: 2670669,
  },
];
const privateKeys = {
  RTPSdYw3iB93L6Hb9xWd1ixVxPYu1QePdi:
    "L2GD7txjmdKSTy7mBq2FowZusjdWP679ttWSRfj4eLBu2usTWMV9",
  RSuQSgXXr1z4gKommSqhHLffiNxnSE3Bwn:
    "Kxj2xMvLbcXeGzuSrZLtpnZWzXnTXnhtuCQRQhKLjN7bSQXuakyh",
};
const signed = Signer.sign("xna", raw, UTXOs, privateKeys);
console.log(signed);


```

## What we need

We need code that can take the UNSIGNED transaction, and sign it using the private keys.
This transaction transfers one FREN/CIVILAZATION asset/token and pays fees in XNA.

[decoded UNSIGNED transaction](./mock/decodedUnsignedTransaction.json)

[decoded SIGNED transaction](./mock/decodedSignedTransaction.json)

[Private keys](./mock/privateKeys.json)

## Important stuff learned

- Signing a transaction means, sign the inputs to the transaction and sign the whole transaction.

- To sign a transaction, inputs and outputs are not enough, we need the UTXOs used (to get each utxo.script)

- bitcoinjs-lib cant sign an unsigned transaction from Neurai out of the box because
  of this line in transaction_builder.js

  `const prevOutScript = payments.p2pkh({ pubkey: ourPubKey }).output;`

  That is, transaction_builder assumes that the previous outputscript was "just" our pub key/address, that is not true in the case of Neurai asset transfer transactions.

## Stuff to look at

https://github.com/bitpay/bitcore-lib/blob/master/lib/script/script.js
