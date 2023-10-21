import React from "react";
import Image from "next/image";
import styles from "./TokenImageContainer.module.css";

export interface ImageMetadata {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface TokenImageContainerProps {
  baseTokenImageMetadata: ImageMetadata;
  quoteTokenImageMetadata: ImageMetadata;
}

const TokenImageContainer = ({
  baseTokenImageMetadata,
  quoteTokenImageMetadata,
}: TokenImageContainerProps) => {
  return (
    <div className={styles.dualTokenImageContainer}>
      {baseTokenImageMetadata && quoteTokenImageMetadata ? (
        <>
          <div className={styles.tokenImageContainer}>
            <Image
              src={baseTokenImageMetadata.url}
              width={baseTokenImageMetadata.width}
              height={baseTokenImageMetadata.height}
              alt={baseTokenImageMetadata.alt}
              className={styles.tokenImage}
            />
          </div>

          <div className={styles.tokenImageContainer}>
            <Image
              src={quoteTokenImageMetadata.url}
              width={quoteTokenImageMetadata.width}
              height={quoteTokenImageMetadata.height}
              alt={quoteTokenImageMetadata.alt}
              className={styles.tokenImage}
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default TokenImageContainer;
