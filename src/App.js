import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction
} from "@solana/web3.js";
import { Token } from "@solana/spl-token";
import { Wallet } from "@project-serum/sol-wallet-adapter";

const App = () => {
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    try {
      const wallet = new Wallet("https://www.sollet.io", "devnet"); // Replace 'mainnet' with 'testnet' for the Solana testnet
      await wallet.connect();
      setStatus("Wallet connected");
      return wallet;
    } catch (error) {
      setStatus("Error connecting wallet: " + error.message);
    }
  };

  const mintNft = async (wallet) => {
    try {
      const connection = new Connection("https://solana-api.projectserum.com");
      const walletPublicKey = wallet.publicKey;
      const walletKeypair = wallet.wallet;

      const mintAuthority = walletPublicKey;
      const mintPublicKey = new PublicKey("YOUR_MINT_PUBLIC_KEY");
      const tokenAccountPublicKey = new PublicKey(
        "YOUR_TOKEN_ACCOUNT_PUBLIC_KEY"
      );
      const tokenProgramId = Token.TOKEN_PROGRAM_ID;

      const transaction = new Transaction();
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: walletPublicKey,
          newAccountPubkey: mintPublicKey,
          lamports: 10000000,
          space: 82,
          programId: tokenProgramId
        })
      );

      // Initialize the mint
      transaction.add(
        Token.createInitMintInstruction(
          tokenProgramId,
          mintPublicKey,
          0, // Decimals
          walletPublicKey, // Mint authority
          walletPublicKey // Freeze authority
        )
      );

      // Create a token account
      transaction.add(
        Token.createInitAccountInstruction(
          tokenProgramId,
          mintPublicKey,
          tokenAccountPublicKey,
          walletPublicKey
        )
      );

      // Mint NFT to the token account
      transaction.add(
        Token.createMintToInstruction(
          tokenProgramId,
          mintPublicKey,
          tokenAccountPublicKey,
          walletPublicKey, // Mint authority
          [],
          1 // Amount to mint
        )
      );

      // Call the mint_nft program's mint function
      // Adjust the parameters based on your contract's requirements
      transaction.add(
        new TransactionInstruction({
          keys: [
            { pubkey: mintPublicKey, isSigner: false, isWritable: true },
            { pubkey: tokenAccountPublicKey, isSigner: false, isWritable: true }
            // Add more keys as required by your contract
          ],
          programId: new PublicKey(
            "AQm7XTyW4nUDY2aX1Y8uqhnLWWKdNmzGZfMYFHUnwV5"
          ),
          data: Buffer.from([0]) // Adjust the data if needed
        })
      );

      // Sign and send the transaction
      const blockhash = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = walletPublicKey;
      transaction.sign(walletKeypair, mintAuthority);
      const txid = await sendAndConfirmTransaction(connection, transaction);

      setStatus("NFT minted successfully. Transaction ID: " + txid);
    } catch (error) {
      setStatus("Error minting NFT: " + error.message);
    }
  };

  return (
    <div>
      <h1>Solana NFT Minting App</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      <button onClick={mintNft}>Mint NFT</button>
      <p>Status: {status}</p>
    </div>
  );
};

export default App;
