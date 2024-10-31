import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

//used to talk to devnet tools
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

//umi version of user key pair to sign all txs
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("set up umi instance for users");

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "Best Collection",
  symbol: "BC",
  uri: "https://raw.githubusercontent.com/emmanueluwa/nft-solana/refs/heads/main/something.json",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});
await transaction.sendAndConfirm(umi);

//fetch nft
const createdCollecitonNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  `created collection :), Address: ${getExplorerLink(
    "address",
    createdCollecitonNft.mint.publicKey,
    "devnet"
  )}`
);
