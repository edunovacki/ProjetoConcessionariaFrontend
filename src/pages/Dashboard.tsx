import React, { useState, useEffect } from 'react';
import { listarClientes } from '../services/clienteService';
import { listarVeiculos } from '../services/veiculoService';
import { listarOrcamentos } from '../services/orcamentoService';

const Dashboard: React.FC = () => {
    const [totalClientes, setTotalClientes] = useState(0);
    const [totalVeiculos, setTotalVeiculos] = useState(0);
    const [totalOrcamentos, setTotalOrcamentos] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarEstatisticas();
    }, []);

    const carregarEstatisticas = async () => {
        setLoading(true);
        try {
            const orcamentosResponse = await listarOrcamentos(1, 1000);
            setTotalOrcamentos(orcamentosResponse.total);

            // Carregar total de clientes
            const clientesResponse = await listarClientes(1, 1000); // Busca muitos para contar o total
            setTotalClientes(clientesResponse.total);

            // Carregar total de veículos
            const veiculosResponse = await listarVeiculos(1, 1000); // Busca muitos para contar o total
            setTotalVeiculos(veiculosResponse.total);

            // Por enquanto, dados mockados para orçamentos
            // Depois vamos substituir pelo serviço real
            setTotalOrcamentos(0); // Mock - será atualizado quando criar o serviço

        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Carregando estatísticas...</div>;
    }

    return (
        <div>
            <h2 style={styles.title}>Dashboard</h2>
            <p style={styles.subtitle}>Visão geral do sistema</p>

            <div style={styles.grid}>
                {/* Card de Clientes */}
                <div style={styles.card} className="dashboard-card">
                    <div style={styles.cardIcon}>👥</div>
                    <div style={styles.cardContent}>
                        <h3 style={styles.cardTitle}>Clientes</h3>
                        <p style={styles.cardValue}>{totalClientes}</p>
                        <p style={styles.cardDescription}>Clientes cadastrados no sistema</p>
                    </div>
                </div>

                {/* Card de Veículos */}
                <div style={styles.card} className="dashboard-card">
                    <div style={styles.cardIcon}>🚗</div>
                    <div style={styles.cardContent}>
                        <h3 style={styles.cardTitle}>Veículos</h3>
                        <p style={styles.cardValue}>{totalVeiculos}</p>
                        <p style={styles.cardDescription}>Veículos cadastrados</p>
                    </div>
                </div>

                {/* Card de Orçamentos */}
                <div style={styles.card} className="dashboard-card">
                    <div style={styles.cardIcon}>📝</div>
                    <div style={styles.cardContent}>
                        <h3 style={styles.cardTitle}>Orçamentos</h3>
                        <p style={styles.cardValue}>{totalOrcamentos}</p>
                        <p style={styles.cardDescription}>Orçamentos realizados</p>
                    </div>
                </div>
            </div>

            {/* Seção de informações rápidas */}
            <div style={styles.infoSection}>
                <h3 style={styles.infoTitle}>Informações Rápidas</h3>
                <div style={styles.infoGrid}>
                    <div style={styles.infoCard}>
                        <strong>Últimos Clientes</strong>
                        <p style={styles.infoText}>Gerencie os clientes cadastrados</p>
                        <a href="/clientes" style={styles.infoLink}>Ver todos →</a>
                    </div>
                    <div style={styles.infoCard}>
                        <strong>Veículos em Estoque</strong>
                        <p style={styles.infoText}>Veículos disponíveis para venda</p>
                        <a href="/veiculos" style={styles.infoLink}>Ver todos →</a>
                    </div>
                    <div style={styles.infoCard}>
                        <strong>Orçamentos</strong>
                        <p style={styles.infoText}>Crie e gerencie orçamentos</p>
                        <a href="/orcamentos" style={styles.infoLink}>Ver todos →</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    title: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '8px'
    },
    subtitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '24px'
    },
    loading: {
        textAlign: 'center' as const,
        padding: '40px',
        fontSize: '18px',
        color: '#666'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        cursor: 'pointer',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
    },
    cardIcon: {
        fontSize: '48px',
        backgroundColor: '#f8f9fa',
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%'
    },
    cardContent: {
        flex: 1
    },
    cardTitle: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px',
        textTransform: 'uppercase' as const
    },
    cardValue: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '8px'
    },
    cardDescription: {
        fontSize: '12px',
        color: '#999'
    },
    infoSection: {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    infoTitle: {
        fontSize: '18px',
        color: '#333',
        marginBottom: '16px'
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
    },
    infoCard: {
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        borderLeft: '4px solid #007bff'
    },
    infoText: {
        fontSize: '13px',
        color: '#666',
        marginTop: '8px',
        marginBottom: '8px'
    },
    infoLink: {
        color: '#007bff',
        textDecoration: 'none',
        fontSize: '12px',
        cursor: 'pointer'
    }
};

export default Dashboard;