import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarOrcamentos, deletarOrcamento } from '../services/orcamentoService';
import { Orcamento } from '../types/orcamento';

const Orcamentos: React.FC = () => {
  const navigate = useNavigate();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [orcamentoDeletando, setOrcamentoDeletando] = useState<number | null>(null);
  const itensPorPagina = 5;

  useEffect(() => {
    carregarOrcamentos();
  }, [pagina]);

  const carregarOrcamentos = async () => {
    setLoading(true);
    try {
      const response = await listarOrcamentos(pagina, itensPorPagina);
      setOrcamentos(response.dados);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
      alert('Erro ao carregar lista de orçamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este orçamento?')) {
      return;
    }

    setOrcamentoDeletando(id);
    try {
      await deletarOrcamento(id);
      alert('Orçamento deletado com sucesso!');
      carregarOrcamentos();
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      alert('Erro ao deletar orçamento');
    } finally {
      setOrcamentoDeletando(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/orcamentos/editar/${id}`);
  };

  const handleNovo = () => {
    navigate('/orcamentos/novo');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pendente': return '#ffc107';
      case 'aprovado': return '#28a745';
      case 'recusado': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusTexto = (status: string) => {
    switch(status) {
      case 'pendente': return 'Pendente';
      case 'aprovado': return 'Aprovado';
      case 'recusado': return 'Recusado';
      default: return status;
    }
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const totalPaginas = Math.ceil(total / itensPorPagina);

  return (
    <div>
      <div style={styles.header}>
        <h2>Orçamentos</h2>
        <button onClick={handleNovo} style={styles.buttonNovo}>
          + Novo Orçamento
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
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Validade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map((orcamento) => (
                <tr key={orcamento.id}>
                  <td>{orcamento.id}</td>
                  <td>{orcamento.cliente?.nome || 'Cliente não encontrado'}</td>
                  <td>{orcamento.veiculo?.modelo || 'Veículo não encontrado'}</td>
                  <td>{formatarData(orcamento.dataOrcamento)}</td>
                  <td>{formatarPreco(orcamento.valorTotal)}</td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(orcamento.status)
                    }}>
                      {getStatusTexto(orcamento.status)}
                    </span>
                  </td>
                  <td>{formatarData(orcamento.dataValidade)}</td>
                  <td style={styles.acoes}>
                    <button
                      onClick={() => handleEditar(orcamento.id)}
                      style={styles.buttonEditar}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(orcamento.id)}
                      style={styles.buttonDeletar}
                      disabled={orcamentoDeletando === orcamento.id}
                    >
                      {orcamentoDeletando === orcamento.id ? 'Deletando...' : 'Deletar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orcamentos.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhum orçamento cadastrado.</p>
              <button onClick={handleNovo} style={styles.buttonNovoEmpty}>
                Criar primeiro orçamento
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
                Página {pagina} de {totalPaginas} ({total} orçamentos)
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

export default Orcamentos;