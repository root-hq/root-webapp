import React from 'react';
import styles from './VaultContainer.module.css';
import { TokenMetadata, UnifiedVault } from '@squarerootlabs/root-db-utils/src/supabase';
import TokenImageContainer, { ImageMetadata } from '../TokenImageContainer';

export interface VaultContainerProps {
    vault: UnifiedVault,
    baseToken: TokenMetadata,
    quoteToken: TokenMetadata
}

const VaultContainer = ({ vault, baseToken, quoteToken }: VaultContainerProps) => {
    return (
        <div
            className={styles.vaultContainer}
        >
            <>
                {
                    baseToken && quoteToken && baseToken.img_url && quoteToken.img_url ?
                        <>
                            <TokenImageContainer 
                                baseTokenImageMetadata={
                                    {
                                        url: baseToken.img_url,
                                        width: 40,
                                        height: 40,
                                        alt: `Quote token: ${baseToken.ticker}`
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
            </>
            <p>{`Vault: ${vault.vault_address}`}</p>
        </div>
    );
}

export default VaultContainer;