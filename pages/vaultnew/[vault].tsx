import React, { useEffect, useState } from 'react';
import styles from './NewVaultPage.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import PairInfoRow from './components/PairInfoRow';
import VaultInfoRow from './components/VaultInfoRow';

export interface NewVaultPageProps {
}

const NewVaultPage = ({ }: NewVaultPageProps) => {    
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

    return(
        <Container className={styles.vaultPageContainer}>
            <Row className={styles.vaultInfoContainer}>Yo</Row>
            <Row><PairInfoRow /></Row>
            <Row><VaultInfoRow /></Row>
        </Container>
    )
}

export default NewVaultPage;