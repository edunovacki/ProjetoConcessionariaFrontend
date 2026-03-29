import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarVeiculos, deletarVeiculo } from '../services/veiculoService';
import { listarClientes } from '../services/clienteService';
import { Veiculo } from '../types/veiculo';

const Veiculos: React.FC = () => {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [veiculoDeletando, setVeiculoDeletando] = useState<number | null>(null);
  const itensPorPagina = 5;

  useEffect(() => {
    carregarDados();
  }, [pagina]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const veiculosResponse = await listarVeiculos(pagina, itensPorPagina);
      setVeiculos(veiculosResponse.dados);
      setTotal(veiculosResponse.total);
      
      // Carregar clientes para mostrar o nome
      const clientesResponse = await listarClientes(1, 1000);
      const clientesMap: { [key: number]: string } = {};
      clientesResponse.dados.forEach(cliente => {
        clientesMap[cliente.id] = cliente.nome;
      });
      setClientes(clientesMap);
      
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
      carregarDados();
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
                <th>Placa</th>
                <th>Modelo</th>
                <th>Marca</th>
                <th>Ano</th>
                <th>Cor</th>
                <th>Cliente</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.id}</td>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.marca}</td>
                  <td>{veiculo.ano}</td>
                  <td>{veiculo.cor}</td>
                  <td>{clientes[veiculo.clienteId] || 'Cliente não encontrado'}</td>
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

          {veiculos.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhum veículo cadastrado.</p>
              <button onClick={handleNovo} style={styles.buttonNovoEmpty}>
                Cadastrar primeiro veículo
              </button>
            </div>
          )}

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
  buttonNovoEmpty: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px'
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
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
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
  }
};

export default Veiculos;