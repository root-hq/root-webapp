import React, { useEffect, useState } from "react";
import styles from "./VaultContainer.module.css";
import TokenImageContainer, { ImageMetadata } from "../TokenImageContainer";
import { Button } from "react-bootstrap";
import KeyValueComponent, { KeyValueJustification } from "../KeyValueComponent";
import { TokenMetadata, UnifiedVault } from "../../utils/supabase";
import Link from "next/link";

export interface VaultContainerProps {
  vault: UnifiedVault;
  baseToken: TokenMetadata;
  quoteToken: TokenMetadata;
}

const VaultContainer = ({
  vault,
  baseToken,
  quoteToken,
}: VaultContainerProps) => {
  const [windowSize, setWindowSize] = useState([0, 0]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <div className={styles.vaultContainer}>
      <div className={styles.vaultDetailsContainer}>
        <div className={styles.tokenInfoContainer}>
          <div className={styles.tokenImageContainer}>
            {baseToken &&
            quoteToken &&
            baseToken.img_url &&
            quoteToken.img_url ? (
              <>
                <TokenImageContainer
                  baseTokenImageMetadata={
                    {
                      url: baseToken.img_url,
                      width: 40,
                      height: 40,
                      alt: `Base token: ${baseToken.ticker}`,
                    } as ImageMetadata
                  }
                  quoteTokenImageMetadata={
                    {
                      url: quoteToken.img_url,
                      width: 40,
                      height: 40,
                      alt: `Quote token: ${quoteToken.ticker}`,
                    } as ImageMetadata
                  }
                />
              </>
            ) : (
              <></>
            )}
          </div>
          <span
            className={styles.vaultNameContainer}
          >{`${baseToken.ticker}-${quoteToken.ticker}`}</span>
        </div>
        <div className={styles.exchangeInfoContainer}>
          <span className={styles.exchangeText}>{vault.exchange}</span>
        </div>
      </div>
      <div className={styles.depositDetailsContainer}>
        <KeyValueComponent
          keyElement={<span>{`Total Deposits`}</span>}
          keyElementStyle={{
            fontWeight: "bold",
            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
            color: "#999",
          }}
          valueElement={<span>{`$100`}</span>}
          valueElementStyle={{
            fontWeight: "bold",
            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
            color: "white",
          }}
          justification={KeyValueJustification.SpaceBetween}
        />
      </div>
      <div className={styles.viewButtonContainer}>
        <Link href={`/vault/${vault.vault_address}`}>
          <Button className={styles.viewButton}>View</Button>
        </Link>
      </div>
    </div>
  );
};

export default VaultContainer;
