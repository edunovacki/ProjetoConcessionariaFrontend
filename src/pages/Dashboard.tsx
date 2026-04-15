import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarClientes } from '../services/clienteService';
import { listarTodosVeiculos } from '../services/veiculoService';
import { listarTodasOrdensServico } from '../services/ordemServicoService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faTools, faClock, faCheck } from '@fortawesome/free-solid-svg-icons';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVeiculos, setTotalVeiculos] = useState(0);
  const [totalOrdens, setTotalOrdens] = useState(0);
  const [emAndamento, setEmAndamento] = useState(0);
  const [concluido, setConcluido] = useState(0);
  const [aguardandoRetirada, setAguardandoRetirada] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const clientesResponse = await listarClientes(1, 1000);
      setTotalClientes(clientesResponse.total);

      const veiculosResponse = await listarTodosVeiculos();
      setTotalVeiculos(veiculosResponse.length);

      const ordens = await listarTodasOrdensServico();
      setTotalOrdens(ordens.length);
      setEmAndamento(ordens.filter(o => o.status === 'em_andamento').length);
      setConcluido(ordens.filter(o => o.status === 'concluido').length);
      setAguardandoRetirada(ordens.filter(o => o.status === 'aguardando_retirada').length);
      
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
      <h2 style={styles.title}>PAINEL DE CONTROLE</h2>
      <p style={styles.subtitle}>Acompanhe todos os veículos em tempo real</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faCar} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Total de Veículos</h3>
            <p style={styles.cardValue}>{totalVeiculos}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faTools} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Em Andamento</h3>
            <p style={styles.cardValue}>{emAndamento}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faCheck} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Concluído</h3>
            <p style={styles.cardValue}>{concluido}</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faClock} color="#2c3e50"/>
          </div>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Aguardando Retirada</h3>
            <p style={styles.cardValue}>{aguardandoRetirada}</p>
          </div>
        </div>
      </div>

      <div style={styles.infoSection}>
        <h3 style={styles.infoTitle}>GESTÃO DE SERVIÇO</h3>
        <p style={styles.infoText}>Total de ordens de serviço: {totalOrdens}</p>
      </div>
    </div>
  );
};

const styles = {
  title: {
    fontSize: '30px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#666',
    marginBottom: '24px'
  },
  loading: {
    textAlign: 'center' as const,
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardIcon: {
    fontSize: '48px',
    backgroundColor: '#f8f9fa',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  },
  cardContent: {
    flex: 1,
    fontFamily: "Arial, Helvetica, sans-serif"
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
    color: '#333'
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  infoTitle: {
    fontSize: '20px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333',
    marginBottom: '8px'
  },
  infoText: {
    fontSize: '15px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#666'
  }
};

export default Dashboard;