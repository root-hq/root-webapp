import { BN, web3 } from "@coral-xyz/anchor";
import {
  getBaseTokenVaultAddress,
  getQuoteTokenVaultAddress,
  getVaultAccount,
} from "@squarerootlabs/root-market-maker";
import assert from "assert";

export interface VaultBalance {
  baseTokenBalance: number;
  quoteTokenBalance: number;
}

export const getVaultBalance = async (
  vaultAddress: string,
): Promise<VaultBalance> => {
  try {
    const endpoint = process.env.RPC_ENDPOINT;
    const connection = new web3.Connection(endpoint);

    const baseTokenBalance = (
      await connection.getTokenAccountBalance(
        getBaseTokenVaultAddress(new web3.PublicKey(vaultAddress)),
      )
    ).value.uiAmount;
    const quoteTokenBalance = (
      await connection.getTokenAccountBalance(
        getQuoteTokenVaultAddress(new web3.PublicKey(vaultAddress)),
      )
    ).value.uiAmount;

    return {
      baseTokenBalance,
      quoteTokenBalance,
    } as VaultBalance;
  } catch (err) {
    console.log("Error fetching vault balance: ", err);
    return {
      baseTokenBalance: 0,
      quoteTokenBalance: 0,
    } as VaultBalance;
  }
};

export const isVaultOnDowntime = async (
  vaultAddress: String,
): Promise<boolean> => {
  const vaultAc = await getVaultAccount(
    new web3.PublicKey(vaultAddress),
    process.env.RPC_ENDPOINT,
  );

  const connection = new web3.Connection(process.env.RPC_ENDPOINT);

  if (vaultAc) {
    const currentSlot: BN = new BN(
      await connection.getSlot({ commitment: "processed" }),
    );

    if (
      currentSlot.gte(vaultAc.downtimeStartSlot) &&
      currentSlot.lt(vaultAc.downtimeEndSlot)
    ) {
      return true;
    }
  }
  return false;
};

export const getTimeToDowntime = async (
  vaultAddress: string,
): Promise<number> => {
  const vaultAc = await getVaultAccount(
    new web3.PublicKey(vaultAddress),
    process.env.RPC_ENDPOINT,
  );

  const connection = new web3.Connection(process.env.RPC_ENDPOINT);

  if (vaultAc) {
    const currentSlot: BN = new BN(
      await connection.getSlot({ commitment: "processed" }),
    );

    //@ts-ignore
    return vaultAc.downtimeStartSlot.sub(currentSlot).toNumber();
  }
  return 0;
};

// Function to calculate the greatest common divisor (gcd) using Euclid's algorithm
const calculateGCD = (a: number, b: number): number => {
  while (b != 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

export interface AdjustedDepositRatio {
  baseTokenQuantity: number;
  quoteTokenQuantity: number;
}

export const matchDepositRatios = async (
  vaultAddr: string,
  maxBaseTokenDeposit: number,
  maxQuoteTokenDeposit: number,
): Promise<AdjustedDepositRatio> => {
  const { baseTokenBalance, quoteTokenBalance } =
    await getVaultBalance(vaultAddr);

  if (baseTokenBalance === 0 && quoteTokenBalance === 0) {
    return {
      baseTokenQuantity: maxBaseTokenDeposit,
      quoteTokenQuantity: maxQuoteTokenDeposit,
    };
  } else if (baseTokenBalance > 0 && quoteTokenBalance === 0) {
    return {
      baseTokenQuantity: maxBaseTokenDeposit,
      quoteTokenQuantity: 0,
    };
  } else if (baseTokenBalance === 0 && quoteTokenBalance > 0) {
    return {
      baseTokenQuantity: 0,
      quoteTokenQuantity: maxQuoteTokenDeposit,
    };
  }

  let gcd = calculateGCD(baseTokenBalance, quoteTokenBalance);
  let proportionA = baseTokenBalance / gcd;
  let proportionB = quoteTokenBalance / gcd;

  let maxTokenA = (maxQuoteTokenDeposit / proportionB) * proportionA;
  maxTokenA = Math.min(maxTokenA, maxBaseTokenDeposit);

  let maxTokenB = (maxBaseTokenDeposit / proportionA) * proportionB;
  maxTokenB = Math.min(maxTokenB, maxQuoteTokenDeposit);

  assert(
    maxTokenA * quoteTokenBalance === maxTokenB * baseTokenBalance,
    "Error adjusting deposit ratios",
  );

  return {
    baseTokenQuantity: maxTokenA,
    quoteTokenQuantity: maxTokenB,
  };
};

export const calculateTokenDeposit = (
  vaultTokenBalance: VaultBalance,
  maxTokenDeposit: number,
  isDepositBase: boolean,
): number => {
  const { baseTokenBalance, quoteTokenBalance } = vaultTokenBalance;
  if (isDepositBase) {
    let quoteTokenDeposit =
      (quoteTokenBalance * maxTokenDeposit) / baseTokenBalance;

    return quoteTokenDeposit;
  } else {
    let baseTokenDeposit =
      (baseTokenBalance * maxTokenDeposit) / quoteTokenBalance;

    return baseTokenDeposit;
  }
};
