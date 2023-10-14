import React, { useEffect, useState } from 'react';
import styles from './VaultContainer.module.css';
import { TokenMetadata, UnifiedVault } from '@squarerootlabs/root-db-utils/src/supabase';
import TokenImageContainer, { ImageMetadata } from '../TokenImageContainer';
import { Button } from 'react-bootstrap';
import KeyValueText, { KeyValueJustification } from '../KeyValueText';

export interface VaultContainerProps {
    vault: UnifiedVault,
    baseToken: TokenMetadata,
    quoteToken: TokenMetadata
}

const VaultContainer = ({ vault, baseToken, quoteToken }: VaultContainerProps) => {

    const [windowSize, setWindowSize] = useState([0,0]);

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };
    
        window.addEventListener('resize', handleWindowResize);
    
        return () => {
          window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    
    return (
        <div
            className={styles.vaultContainer}
        >
            <div className={styles.vaultDetailsContainer}>
                <div className={styles.tokenInfoContainer}>
                    <div className={styles.tokenImageContainer}>
                        {
                            baseToken && quoteToken && baseToken.img_url && quoteToken.img_url ?
                                <>
                                    <TokenImageContainer 
                                        baseTokenImageMetadata={
                                            {
                                                url: baseToken.img_url,
                                                width: 40,
                                                height: 40,
                                                alt: `Base token: ${baseToken.ticker}`
                                            } as ImageMetadata
                                        }
                                        quoteTokenImageMetadata={
                                            {
                                                url: quoteToken.img_url,
                                                width: 40,
                                                height: 40,
                                                alt: `Quote token: ${quoteToken.ticker}`
                                            } as ImageMetadata
                                        }
                                    />
                                </>
                            :
                                <></>
                        }
                    </div>
                    <span className={styles.vaultNameContainer}>{`${baseToken.ticker}-${quoteToken.ticker}`}</span>
                </div>
                <div className={styles.exchangeInfoContainer}>
                    <span className={styles.exchangeText}>{vault.exchange}</span>
                </div>
            </div>
            <div className={styles.depositDetailsContainer}>
                <KeyValueText
                    keyText='Total Deposits'
                    keyTextStyle={
                        {
                            fontWeight: 'bold',
                            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
                            color: '#999'
                        }
                    }
                    valueText='$69,420'
                    valueTextStyle={
                        {
                            fontWeight: 'bold',
                            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
                            color: 'white'
                        }
                    }
                    justification={KeyValueJustification.SpaceBetween}
                />
            </div>
            <div className={styles.earningDetailsContainer}>
                <KeyValueText
                    keyText='24h fee'
                    keyTextStyle={
                        {
                            fontWeight: 'bold',
                            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
                            color: '#999'
                        }
                    }
                    valueText='$1,210'
                    valueTextStyle={
                        {
                            fontWeight: 'bold',
                            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
                            color: 'white'
                        }
                    }
                    justification={KeyValueJustification.SpaceBetween}
                />
            </div>
            <div className={styles.viewButtonContainer}>
                <Button
                    className={styles.viewButton}
                >
                    View
                </Button>
            </div>
        </div>
    );
}

export default VaultContainer;