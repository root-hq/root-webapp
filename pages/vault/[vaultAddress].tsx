import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './VaultPageContainer.module.css';
import { TokenMetadata, UnifiedVault, getTokenMetadata, getVault } from '../../utils/supabase';
import { getL3Book } from '../../utils/phoenix';
import { L3UiBook } from '@ellipsis-labs/phoenix-sdk';
import { DEFAULT_ORDERBOOK_UPDATE_FREQUENCY_IN_MS, DEFAULT_ORDERBOOK_VIEW_DEPTH } from '../../constants';
import { Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import L3UiBookDisplay from '../../components/L3UiBookDisplay';
import { VaultBalance, getVaultBalance } from '../../utils/root/utils';
import TokenImageContainer, { ImageMetadata } from '../../components/TokenImageContainer';
import Tag from '../../components/Tag';
import KeyValueComponent, { KeyValueJustification } from '../../components/KeyValueComponent';

export interface VaultPageContainerProps {
    vaultData: UnifiedVault,
    baseTokenMetadata: TokenMetadata,
    quoteTokenMetadata: TokenMetadata,
    vaultBalance: VaultBalance
    l3UiBook: L3UiBook
}

const VaultPageContainer = ({ vaultData, baseTokenMetadata, quoteTokenMetadata, vaultBalance, l3UiBook }: VaultPageContainerProps) => {
    const router = useRouter();
    
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

    const [l3UiBookState, setL3UiBookState] = useState(l3UiBook);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                let latestBook = await getL3Book(vaultData.market_address, DEFAULT_ORDERBOOK_VIEW_DEPTH);
                setL3UiBookState(() => ({...latestBook}));
            }
            catch(error) {
                console.error(`Error polling latest L3 book: `, error);
            }            
        }, DEFAULT_ORDERBOOK_UPDATE_FREQUENCY_IN_MS);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);

    }, [l3UiBook, vaultData.market_address]);

    return(
        <Container className={styles.vaultPageContainer}>
            <Row className={styles.firstRow}>
                <div className={styles.navigationContainer}>
                    <span
                        className={styles.backLinkContainer}
                    >
                        <Link
                            href="/"
                            className={styles.backLink}
                        >
                            All Strategies
                        </Link>
                    </span>
                    <span
                        className={styles.arrowContainer}
                    >{`>`}</span>
                    <span
                        className={styles.vaultAddressContainer}
                    >{`${baseTokenMetadata.ticker}-${quoteTokenMetadata.ticker}`}</span>
                </div>
                <div className={styles.vaultMetadataContainer}>
                    <div className={styles.vaultTokenLogoContainer}>
                        <div className={styles.tokenImageContainer}>
                            {
                                baseTokenMetadata && quoteTokenMetadata && baseTokenMetadata.img_url && quoteTokenMetadata.img_url ?
                                    <>
                                        <TokenImageContainer 
                                            baseTokenImageMetadata={
                                                {
                                                    url: baseTokenMetadata.img_url,
                                                    width: windowSize[0] > 425 ? 50 : 40,
                                                    height: windowSize[0] > 425 ? 50 : 40,
                                                    alt: `Base token: ${baseTokenMetadata.ticker}`
                                                } as ImageMetadata
                                            }
                                            quoteTokenImageMetadata={
                                                {
                                                    url: quoteTokenMetadata.img_url,
                                                    width: windowSize[0] > 425 ? 50 : 40,
                                                    height: windowSize[0] > 425 ? 50 : 40,
                                                    alt: `Quote token: ${quoteTokenMetadata.ticker}`
                                                } as ImageMetadata
                                            }
                                        />
                                    </>
                                :
                                    <></>
                            }
                        </div>
                    </div>
                    <div className={styles.vaultNameContainer}>
                        <span className={styles.vaultName}>{`${baseTokenMetadata.ticker}-${quoteTokenMetadata.ticker}`}</span>
                    </div>
                </div>
                <div className={styles.tags}>
                    <Tag
                        value={<span>{`PHOENIX`}</span>}
                        valueStyle={
                            {
                                color: '#477df2',
                                fontSize: windowSize[0] > 320 ? '0.8rem': '0.65rem',
                                padding: '0.5rem',
                                border: '1px solid #888',
                                borderRadius: '0.25rem',
                                backgroundColor: '#111',
                                fontWeight: 'bold',
                                marginLeft: '0.5rem',
                                marginRight: '0.5rem',
                            }
                        }
                    />
                    <Tag
                        value={<span>{`No hedging`}</span>}
                        valueStyle={
                            {
                                color: '#f4c910',
                                fontSize: windowSize[0] > 320 ? '0.8rem': '0.65rem',
                                padding: '0.5rem',
                                border: '1px solid #888',
                                borderRadius: '0.25rem',
                                backgroundColor: '#111',
                                fontWeight: 600,
                                marginLeft: '0.5rem',
                                marginRight: '0.5rem',
                            }
                        }
                    />
                </div>
            </Row>
            <Row className={styles.vaultAndBookContainer}>
                <Col md = {6} xs = {12} className={styles.vaultInfoColumn}>
                    <div className={styles.vaultInfoContainer}>
                        <div className={styles.vaultBalanceContainer}>
                            <div className={styles.vaultTitle}>
                                <span>Vault composition</span>
                            </div>
                            <div className={styles.vaultStat}>
                                <KeyValueComponent
                                    keyElement={<span>{`${baseTokenMetadata.ticker} balance`}</span>}
                                    keyTextStyle={
                                        {
                                            fontWeight: 'bold',
                                            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
                                            color: '#999'
                                        }
                                    }
                                    valueElement={<div><span>{`${vaultBalance.baseTokenBalance}`}</span><span>{`${vaultBalance.baseTokenBalance}`}</span></div>}
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
                            <div className={styles.vaultStat}>
                                <KeyValueComponent
                                    keyElement={<span>{`${quoteTokenMetadata.ticker} balance`}</span>}
                                    keyTextStyle={
                                        {
                                            fontWeight: 'bold',
                                            fontSize: windowSize[0] > 425 ? `1.25rem` : `1rem`,
                                            color: '#999'
                                        }
                                    }
                                    valueElement={<span>{`${vaultBalance.quoteTokenBalance}`}</span>}
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
                        </div>
                    </div>
                </Col>
                <Col md = {6} xs = {12} className={styles.bookColumn}>
                    <div className={styles.bookContainer}>
                        <L3UiBookDisplay l3UiBook = {l3UiBookState} />
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

export async function getServerSideProps({ params }) {
    const { vaultAddress } = params;
    
    const vaultData = (await getVault(vaultAddress))[0];

    const baseTokenMetadata = (await getTokenMetadata(vaultData.base_token_address))[0];
    const quoteTokenMetadata = (await getTokenMetadata(vaultData.quote_token_address))[0];

    const l3UiBook = await getL3Book(vaultData.market_address, DEFAULT_ORDERBOOK_VIEW_DEPTH);

    const vaultBalance = await getVaultBalance(vaultAddress);

    return {
        props: {
            vaultData: vaultData ? vaultData : null,
            baseTokenMetadata: baseTokenMetadata ? baseTokenMetadata : null,
            quoteTokenMetadata: quoteTokenMetadata ? quoteTokenMetadata : null,
            vaultBalance,
            l3UiBook: l3UiBook ? l3UiBook : null
        }
    }
}

export default VaultPageContainer;