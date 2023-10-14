import React from 'react';
import { useRouter } from 'next/router';
import styles from './VaultPageContainer.module.css';
import { UnifiedVault, getVault } from '../../utils/supabase';
import { getL3Book } from '../../utils/phoenix';
import { L3UiBook } from '@ellipsis-labs/phoenix-sdk';
import { DEFAULT_ORDERBOOK_VIEW_DEPTH } from '../../constants';

export interface VaultPageContainerProps {
    vaultData: UnifiedVault,
    l3UiBook: L3UiBook
}

const VaultPageContainer = ({ vaultData, l3UiBook }: VaultPageContainerProps) => {
    const router = useRouter();
    const { vaultAddress } = router.query;

    return(
        <div className={styles.vaultPageContainer}>
            <span>Vault: {vaultAddress}</span>
            <span>vaultData: {vaultData.exchange}</span>
            <span>Book: {JSON.stringify(l3UiBook)}</span>
        </div>
    )
}

export async function getServerSideProps({ params }) {
    const { vaultAddress } = params;
    
    const vaultData = (await getVault(vaultAddress))[0];

    const l3UiBook = await getL3Book(vaultData.market_address, DEFAULT_ORDERBOOK_VIEW_DEPTH);

    return {
        props: {
            vaultData: vaultData ? vaultData : null,
            l3UiBook: l3UiBook ? l3UiBook : null
        }
    }
}

export default VaultPageContainer;