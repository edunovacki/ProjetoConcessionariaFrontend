import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarVeiculos, deletarVeiculo } from '../services/veiculoService';
import { Veiculo } from '../types/veiculo';

const Veiculos: React.FC = () => {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [veiculoDeletando, setVeiculoDeletando] = useState<number | null>(null);
  const itensPorPagina = 5;

  useEffect(() => {
    carregarVeiculos();
  }, [pagina]);

  const carregarVeiculos = async () => {
    setLoading(true);
    try {
      const response = await listarVeiculos(pagina, itensPorPagina);
      setVeiculos(response.dados);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      alert('Erro ao carregar lista de veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este veículo?')) {
      return;
    }

    setVeiculoDeletando(id);
    try {
      await deletarVeiculo(id);
      alert('Veículo deletado com sucesso!');
      carregarVeiculos();
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      alert('Erro ao deletar veículo');
    } finally {
      setVeiculoDeletando(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/veiculos/editar/${id}`);
  };

  const handleNovo = () => {
    navigate('/veiculos/novo');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'disponivel': return '#28a745';
      case 'vendido': return '#dc3545';
      case 'reservado': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusTexto = (status: string) => {
    switch(status) {
      case 'disponivel': return 'Disponível';
      case 'vendido': return 'Vendido';
      case 'reservado': return 'Reservado';
      default: return status;
    }
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const totalPaginas = Math.ceil(total / itensPorPagina);

  return (
    <div>
      <div style={styles.header}>
        <h2>Veículos</h2>
        <button onClick={handleNovo} style={styles.buttonNovo}>
          + Novo Veículo
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Carregando...</div>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Modelo</th>
                <th>Marca</th>
                <th>Ano</th>
                <th>Placa</th>
                <th>Cor</th>
                <th>Preço</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.id}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.marca}</td>
                  <td>{veiculo.ano}</td>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.cor}</td>
                  <td>{formatarPreco(veiculo.preco)}</td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(veiculo.status)
                    }}>
                      {getStatusTexto(veiculo.status)}
                    </span>
                  </td>
                  <td style={styles.acoes}>
                    <button
                      onClick={() => handleEditar(veiculo.id)}
                      style={styles.buttonEditar}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(veiculo.id)}
                      style={styles.buttonDeletar}
                      disabled={veiculoDeletando === veiculo.id}
                    >
                      {veiculoDeletando === veiculo.id ? 'Deletando...' : 'Deletar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div style={styles.paginacao}>
              <button
                onClick={() => setPagina(pagina - 1)}
                disabled={pagina === 1}
                style={styles.buttonPagina}
              >
                Anterior
              </button>
              
              <span style={styles.paginaInfo}>
                Página {pagina} de {totalPaginas} ({total} veículos)
              </span>
              
              <button
                onClick={() => setPagina(pagina + 1)}
                disabled={pagina === totalPaginas}
                style={styles.buttonPagina}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  buttonNovo: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'white'
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  acoes: {
    display: 'flex',
    gap: '10px'
  },
  buttonEditar: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  buttonDeletar: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  paginacao: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '20px'
  },
  buttonPagina: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  paginaInfo: {
    fontSize: '14px',
    color: '#666'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
  }
};

export default Veiculos;