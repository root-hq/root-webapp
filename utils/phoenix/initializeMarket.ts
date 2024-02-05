import { InitializeParams, PROGRAM_ADDRESS, getLogAuthority } from "@ellipsis-labs/phoenix-sdk";
import * as beet from "@metaplex-foundation/beet";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as web3 from "@solana/web3.js";

export const InitializeMarketStruct = new beet.BeetArgsStruct<{
    instructionDiscriminator: number;
}>([["instructionDiscriminator", beet.u8]], "InitializeMarketStructInstructionArgs");

export type InitializeMarketInstructionAccounts = {
    phoenixProgram: web3.PublicKey;
    logAuthority: web3.PublicKey;
    market: web3.PublicKey;
    marketCreator: web3.PublicKey;
    base: web3.PublicKey;
    quote: web3.PublicKey;
    baseVault: web3.PublicKey;
    quoteVault: web3.PublicKey;
    systemProgram: web3.PublicKey;
    tokenProgram: web3.PublicKey;
};

export const initializeMarketInstructionDiscriminator = 100;

function initializeMarketInstruction(
    accounts: InitializeMarketInstructionAccounts,
    args: InitializeParams,
    programId = new web3.PublicKey("PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY")
  ) {
    const [data] = InitializeMarketStruct.serialize({
      instructionDiscriminator: initializeMarketInstructionDiscriminator,
      ...args,
    });
    const keys: web3.AccountMeta[] = [
      {
        pubkey: accounts.phoenixProgram ?? new web3.PublicKey(PROGRAM_ADDRESS),
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: accounts.logAuthority,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: accounts.market,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.marketCreator,
        isWritable: true,
        isSigner: true,
      },
      {
        pubkey: accounts.base,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: accounts.quote,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: accounts.baseVault,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.quoteVault,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: accounts.tokenProgram ?? TOKEN_PROGRAM_ID,
        isWritable: false,
        isSigner: false,
      },
    ];
  
    const ix = new web3.TransactionInstruction({
      programId,
      keys,
      data,
    });
    return ix;
  }

export const createNewMarketInstruction = (initializeMarketParams: InitializeParams, baseMint: web3.PublicKey, quoteMint: web3.PublicKey, creator: web3.PublicKey,) => {

  const logAuthority = getLogAuthority();

  const marketKeypair = web3.Keypair.generate();
  console.log("New market: ", marketKeypair.publicKey.toString());
  console.log("Base mint: ", baseMint.toString());
  console.log("Quote mint: ", quoteMint.toString());
  
  const baseVault = getPhoenixVaultAddress(marketKeypair.publicKey, baseMint);
  const quoteVault = getPhoenixVaultAddress(marketKeypair.publicKey, quoteMint);

  let PHOENIX_PROGRAM = new web3.PublicKey(PROGRAM_ADDRESS);

  const initializeMarketAccounts = {
    phoenixProgram: PHOENIX_PROGRAM,
    logAuthority,
    market: marketKeypair.publicKey,
    marketCreator: creator,
    base: baseMint,
    quote: quoteMint,
    baseVault,
    quoteVault,
    systemProgram: web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
  } as InitializeMarketInstructionAccounts;

  const createMarketAccountIx = web3.SystemProgram.createAccount({
    fromPubkey: creator,
    newAccountPubkey: marketKeypair.publicKey,
    lamports: 100_000,
    space: 1000,
    programId: PHOENIX_PROGRAM
  });

  let ix = initializeMarketInstruction(initializeMarketAccounts, initializeMarketParams);

  return [createMarketAccountIx, ix];
}

export const getPhoenixVaultAddress = (marketAddress: web3.PublicKey, tokenMint: web3.PublicKey) => {
  const [vaultAddress,] = web3.PublicKey.findProgramAddressSync([
    Buffer.from("vault"),
    marketAddress.toBuffer(),
    tokenMint.toBuffer()
  ], new web3.PublicKey(PROGRAM_ADDRESS));

  return vaultAddress;
}