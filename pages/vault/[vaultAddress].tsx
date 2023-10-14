import React from 'react';
import { useRouter } from 'next/router';
import styles from './VaultPageContainer.module.css';
import { UnifiedVault, getVault } from '../../utils/supabase';

export interface VaultPageContainerProps {
    vaultData: UnifiedVault
}

const VaultPageContainer = ({ vaultData }: VaultPageContainerProps) => {
    const router = useRouter();
    const { vaultAddress } = router.query;

    return(
        <div className={styles.vaultPageContainer}>
            <span>Vault: {vaultAddress}</span>
            <span>vaultData: {vaultData.exchange}</span>
        </div>
    )
}

export async function getServerSideProps({ params }) {
    const { vaultAddress } = params;
    
    const vaultData = (await getVault(vaultAddress))[0];

    return {
        props: {
            vaultData: vaultData ? vaultData : null
        }
    }
}

export default VaultPageContainer;