import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarOrdensServico, deletarOrdemServico } from '../services/ordemServicoService';
import { listarDepartamentos } from '../services/departamentoService';
import { OrdemServico } from '../types/ordemServico';
import { Departamento } from '../types/departamento';

const OrdensServico: React.FC = () => {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDepartamento, setFiltroDepartamento] = useState<number>(0);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [ordemDeletando, setOrdemDeletando] = useState<number | null>(null);
  const itensPorPagina = 6;

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  useEffect(() => {
    carregarOrdens();
  }, [pagina, filtroDepartamento, filtroStatus]);

  const carregarDepartamentos = async () => {
    try {
      const dados = await listarDepartamentos();
      setDepartamentos(dados);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
    }
  };

  const carregarOrdens = async () => {
    setLoading(true);
    try {
      const response = await listarOrdensServico(
        pagina,
        itensPorPagina,
        filtroDepartamento,
        filtroStatus
      );
      setOrdens(response.dados);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
      alert('Erro ao carregar lista de ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta ordem de serviço?')) {
      return;
    }

    setOrdemDeletando(id);
    try {
      await deletarOrdemServico(id);
      alert('Ordem de serviço deletada com sucesso!');
      carregarOrdens();
    } catch (error) {
      console.error('Erro ao deletar ordem:', error);
      alert('Erro ao deletar ordem de serviço');
    } finally {
      setOrdemDeletando(null);
    }
  };

  const handleEditar = (id: number) => {
    navigate(`/ordens-servico/editar/${id}`);
  };

  const handleNovo = () => {
    navigate('/ordens-servico/novo');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'recepcao': return '#17a2b8';
      case 'em_andamento': return '#ffc107';
      case 'concluido': return '#28a745';
      case 'aguardando_retirada': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusTexto = (status: string) => {
    switch(status) {
      case 'recepcao': return 'Recepção';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'aguardando_retirada': return 'Aguardando Retirada';
      default: return status;
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const totalPaginas = Math.ceil(total / itensPorPagina);

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Gestão de Serviço</h2>
          <p style={styles.subtitle}>Acompanhe todos os veículos em tempo real</p>
        </div>
        <button onClick={handleNovo} style={styles.buttonNovo}>
          + Nova Ordem de Serviço
        </button>
      </div>

      {/* Filtros */}
      <div style={styles.filtros}>
        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>Filtrar por Departamento:</label>
          <select
            value={filtroDepartamento}
            onChange={(e) => {
              setFiltroDepartamento(parseInt(e.target.value));
              setPagina(1);
            }}
            style={styles.select}
          >
            <option value={0}>Todos</option>
            {departamentos.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.nome}</option>
            ))}
          </select>
        </div>

        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>Filtrar por Status:</label>
          <select
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPagina(1);
            }}
            style={styles.select}
          >
            <option value="todas">Todas</option>
            <option value="recepcao">Recepção</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
            <option value="aguardando_retirada">Aguardando Retirada</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Carregando ordens de serviço...</div>
      ) : (
        <>
          <div style={styles.grid}>
            {ordens.map((ordem) => (
              <div key={ordem.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.placaModelo}>
                    <span style={styles.placa}>{ordem.placa}</span>
                    <span style={styles.modelo}>{ordem.modelo} - {ordem.ano}</span>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(ordem.status)
                  }}>
                    {getStatusTexto(ordem.status)}
                  </span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.clienteInfo}>
                    <strong>{ordem.cliente?.nome || 'Cliente não encontrado'}</strong>
                    <span style={styles.telefone}>{ordem.cliente?.telefone}</span>
                  </div>

                  <div style={styles.detalhes}>
                    <div style={styles.detalheItem}>
                      <span style={styles.detalheLabel}>Departamento:</span>
                      <span style={{
                        ...styles.departamentoBadge,
                        backgroundColor: ordem.departamento?.cor || '#6c757d'
                      }}>
                        {ordem.departamento?.nome || 'Não definido'}
                      </span>
                    </div>
                    
                    <div style={styles.detalheItem}>
                      <span style={styles.detalheLabel}>Data Entrada:</span>
                      <span>{formatarData(ordem.dataEntrada)}</span>
                    </div>
                    
                    <div style={styles.detalheItem}>
                      <span style={styles.detalheLabel}>Previsão:</span>
                      <span>{formatarData(ordem.dataPrevisao)}</span>
                    </div>
                    
                    <div style={styles.detalheItem}>
                      <span style={styles.detalheLabel}>Tempo Decorrido:</span>
                      <span style={styles.tempoDecorrido}>{ordem.tempoDecorrido} dias</span>
                    </div>
                  </div>

                  <div style={styles.servicos}>
                    <strong>Serviços a realizar:</strong>
                    <p>{ordem.servicosRealizar}</p>
                  </div>

                  {ordem.observacoes && (
                    <div style={styles.observacoes}>
                      <strong>Observações:</strong>
                      <p>{ordem.observacoes}</p>
                    </div>
                  )}

                  <div style={styles.consultor}>
                    <span>Consultor: {ordem.consultorResponsavel}</span>
                  </div>
                </div>

                <div style={styles.cardActions}>
                  <button
                    onClick={() => handleEditar(ordem.id)}
                    style={styles.buttonEditar}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(ordem.id)}
                    style={styles.buttonDeletar}
                    disabled={ordemDeletando === ordem.id}
                  >
                    {ordemDeletando === ordem.id ? 'Deletando...' : 'Deletar'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {ordens.length === 0 && (
            <div style={styles.emptyState}>
              <p>Nenhuma ordem de serviço encontrada.</p>
              <button onClick={handleNovo} style={styles.buttonNovoEmpty}>
                Criar primeira ordem de serviço
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
                Página {pagina} de {totalPaginas} ({total} ordens)
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
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
    gap: '16px'
  },
  title: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666'
  },
  buttonNovo: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
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
  filtros: {
    display: 'flex',
    gap: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  filtroGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  filtroLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    minWidth: '150px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
  },
  cardHeader: {
    backgroundColor: '#f8f9fa',
    padding: '16px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  placaModelo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  placa: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333'
  },
  modelo: {
    fontSize: '14px',
    color: '#666'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  cardContent: {
    padding: '16px'
  },
  clienteInfo: {
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  telefone: {
    color: '#666',
    fontSize: '12px'
  },
  detalhes: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px'
  },
  detalheItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  },
  detalheLabel: {
    fontSize: '11px',
    color: '#999',
    textTransform: 'uppercase' as const
  },
  departamentoBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'inline-block',
    width: 'fit-content'
  },
  tempoDecorrido: {
    fontWeight: 'bold',
    color: '#ffc107'
  },
  servicos: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  observacoes: {
    backgroundColor: '#fff3cd',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '13px'
  },
  consultor: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'right' as const,
    borderTop: '1px solid #e9ecef',
    paddingTop: '12px',
    marginTop: '8px'
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    borderTop: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa'
  },
  buttonEditar: {
    flex: 1,
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  buttonDeletar: {
    flex: 1,
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#666'
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

export default OrdensServico;