import { web3 } from "@coral-xyz/anchor";
import {
  getBaseTokenVaultAddress,
  getQuoteTokenVaultAddress,
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

// Function to calculate the greatest common divisor (gcd) using Euclid's algorithm
const calculateGCD = (a: number, b: number): number => {
  while(b != 0) {
      let temp = b;
      b = a % b;
      a = temp;
  }
  return a;
}

export interface AdjustedDepositRatio {
  baseTokenQuantity: number;
  quoteTokenQuantity: number;
}

export const matchDepositRatios = async(
  vaultAddr: string,
  maxBaseTokenDeposit: number,
  maxQuoteTokenDeposit: number
): Promise<AdjustedDepositRatio> => {

  const { baseTokenBalance, quoteTokenBalance } = await getVaultBalance(vaultAddr);

  if(baseTokenBalance === 0 && quoteTokenBalance === 0) {
    return {
      baseTokenQuantity: maxBaseTokenDeposit,
      quoteTokenQuantity: maxQuoteTokenDeposit
    }
  }
  else if(baseTokenBalance > 0 && quoteTokenBalance === 0) {
    return {
      baseTokenQuantity: maxBaseTokenDeposit,
      quoteTokenQuantity: 0
    }
  }
  else if(baseTokenBalance === 0 && quoteTokenBalance > 0) {
    return {
      baseTokenQuantity: 0,
      quoteTokenQuantity: maxQuoteTokenDeposit
    }
  }

  let gcd = calculateGCD(baseTokenBalance, quoteTokenBalance);
  let proportionA = baseTokenBalance / gcd;
  let proportionB = quoteTokenBalance / gcd;

  let maxTokenA = (maxQuoteTokenDeposit / proportionB) * proportionA;
  maxTokenA = Math.min(maxTokenA, maxBaseTokenDeposit);

  let maxTokenB = (maxBaseTokenDeposit / proportionA) * proportionB;
  maxTokenB = Math.min(maxTokenB, maxQuoteTokenDeposit);

  assert(
    (maxTokenA * quoteTokenBalance) === (maxTokenB * baseTokenBalance),
    "Error adjusting deposit ratios"
  );

  return {
    baseTokenQuantity: maxTokenA,
    quoteTokenQuantity: maxTokenB
  }
}

export const calculateTokenDeposit = async(
  vaultAddr: string,
  maxTokenDeposit: number,
  isDepositBase: boolean
): Promise<AdjustedDepositRatio> => {

  const { baseTokenBalance, quoteTokenBalance } = await getVaultBalance(vaultAddr);

  if(isDepositBase) {
    let quoteTokenDeposit = (quoteTokenBalance * maxTokenDeposit) / baseTokenBalance;

    return  {
      baseTokenQuantity: maxTokenDeposit,
      quoteTokenQuantity: quoteTokenDeposit
    }
  }
  else {
    let baseTokenDeposit = (baseTokenBalance * maxTokenDeposit) / quoteTokenBalance;

    return  {
      baseTokenQuantity: baseTokenDeposit,
      quoteTokenQuantity: maxTokenDeposit
    }
  }
}
