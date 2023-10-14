import React from "react";
import Image from "next/image";
import styles from "./TokenImageContainer.module.css";

export interface ImageMetadata {
    url: string,
    alt: string,
    width: number,
    height: number
}

export interface TokenImageContainerProps {
    baseTokenImageMetadata: ImageMetadata,
    quoteTokenImageMetadata: ImageMetadata 
}

const TokenImageContainer = ({baseTokenImageMetadata, quoteTokenImageMetadata}: TokenImageContainerProps) => {
    return(
        <div
            className={styles.tokenImageContainer}
        >
            {
                baseTokenImageMetadata && quoteTokenImageMetadata ?
                    <>
                        <Image
                            src={baseTokenImageMetadata.url}
                            width={baseTokenImageMetadata.width}
                            height={baseTokenImageMetadata.height}
                            alt={baseTokenImageMetadata.alt}
                        />
                        
                        <Image
                            src={quoteTokenImageMetadata.url}
                            width={quoteTokenImageMetadata.width}
                            height={quoteTokenImageMetadata.height}
                            alt={quoteTokenImageMetadata.alt}
                        />
                    </>
                :
                    <></>
            }
        </div>
    );
}

export default TokenImageContainer;