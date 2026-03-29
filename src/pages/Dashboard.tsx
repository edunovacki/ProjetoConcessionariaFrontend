import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarClientes } from '../services/clienteService';
import { listarTodosVeiculos } from '../services/veiculoService';
import { listarTodasOrdensServico, listarOrdensServico, deletarOrdemServico } from '../services/ordemServicoService';
import { listarDepartamentos } from '../services/departamentoService';
import { OrdemServico } from '../types/ordemServico';
import { Departamento } from '../types/departamento';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar, faTools, faClock, faCheck, faEdit, faTrashAlt, faUser, faPhone, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [totalClientes, setTotalClientes] = useState(0);
  const [totalVeiculos, setTotalVeiculos] = useState(0);
  const [totalOrdens, setTotalOrdens] = useState(0);
  const [emAndamento, setEmAndamento] = useState(0);
  const [emServico, setEmServico] = useState(0);
  const [aguardandoRetirada, setAguardandoRetirada] = useState(0);

  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDepartamento, setFiltroDepartamento] = useState<number>(0);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [busca, setBusca] = useState<string>('');
  const [pagina, setPagina] = useState(1);
  const [totalOrdensLista, setTotalOrdensLista] = useState(0);
  const [ordemDeletando, setOrdemDeletando] = useState<number | null>(null);
  const itensPorPagina = 4;

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    setPagina(1);
    carregarOrdens();
  }, [busca, filtroDepartamento, filtroStatus]);

  useEffect(() => {
    carregarOrdens();
  }, [pagina]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const clientesResponse = await listarClientes(1, 1000);
      setTotalClientes(clientesResponse.total);

      const veiculosResponse = await listarTodosVeiculos();
      setTotalVeiculos(veiculosResponse.length);

      const ordens = await listarTodasOrdensServico();
      setTotalOrdens(ordens.length);
      setEmAndamento(ordens.filter((o: OrdemServico) => o.status === 'em_andamento').length);
      setEmServico(ordens.filter((o: OrdemServico) => o.status === 'recepcao').length);
      setAguardandoRetirada(ordens.filter((o: OrdemServico) => o.status === 'aguardando_retirada').length);

      const deptos = await listarDepartamentos();
      setDepartamentos(deptos);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarOrdens = async () => {
    try {
      const response = await listarOrdensServico(
        pagina,
        itensPorPagina,
        filtroDepartamento,
        filtroStatus,
        busca
      );
      setOrdens(response.dados);
      setTotalOrdensLista(response.total);
    } catch (error) {
      console.error('Erro ao carregar ordens de serviço:', error);
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
      carregarDados();
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
    switch (status) {
      case 'recepcao': return '#17a2b8';
      case 'em_andamento': return '#ffc107';
      case 'concluido': return '#28a745';
      case 'aguardando_retirada': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
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

  const totalPaginas = Math.ceil(totalOrdensLista / itensPorPagina);

  if (loading) {
    return <div style={styles.loading}>Carregando estatísticas...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>PAINEL DE CONTROLE</h2>
      <p style={styles.subtitle}>Acompanhe todos os veículos em tempo real</p>

      {/* Cards de Estatísticas */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Total de Veículos</h3>
            <p style={styles.cardValue}>{totalVeiculos}</p>
          </div>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faCar} color="#2c3e50" />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Em Andamento</h3>
            <p style={styles.cardValue}>{emAndamento}</p>
          </div>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faClock} color="#2c3e50" />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Em Serviço</h3>
            <p style={styles.cardValue}>{emServico}</p>
          </div>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faTools} color="#2c3e50" />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h3 style={styles.cardTitle}>Aguardando Retirada</h3>
            <p style={styles.cardValue}>{aguardandoRetirada}</p>
          </div>
          <div style={styles.cardIcon}>
            <FontAwesomeIcon icon={faCheck} color="#2c3e50" />
          </div>
        </div>
      </div>

      {/* Seção de Gestão de Serviço */}
      <div style={styles.infoSection}>
        <div style={styles.infoHeader}>
          <h3 style={styles.infoTitle}>GESTÃO DE SERVIÇO</h3>
          <p style={styles.infoText}>Total de ordens de serviço: {totalOrdens}</p>
        </div>

        {/* Campo de Busca */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="BUSCAR POR PLACA, MODELO, CLIENTE OU NÚMERO DA O.S..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Filtros */}
        <div style={styles.filtrosContainer}>
          <div style={styles.filtroGroup}>
            <label style={styles.filtroLabel}>FILTRAR POR ETAPA:</label>
            <select
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}
              style={styles.select}
            >
              <option value="todas">TODAS</option>
              <option value="recepcao">RECEPÇÃO</option>
              <option value="em_andamento">EM ANDAMENTO</option>
              <option value="concluido">CONCLUÍDO</option>
              <option value="aguardando_retirada">AGUARDANDO RETIRADA</option>
            </select>
          </div>

          <div style={styles.filtroGroup}>
            <label style={styles.filtroLabel}>FILTRAR POR DEPARTAMENTO:</label>
            <select
              value={filtroDepartamento}
              onChange={(e) => { setFiltroDepartamento(parseInt(e.target.value)); setPagina(1); }}
              style={styles.select}
            >
              <option value={0}>TODOS</option>
              {departamentos.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão Adicionar */}
        <div style={styles.buttonContainer}>
          <button onClick={handleNovo} style={styles.buttonNovo}>
            + ADICIONAR VEÍCULO
          </button>
        </div>

        {/* Cards de Ordens de Serviço */}
        {ordens.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Nenhuma ordem de serviço encontrada.</p>
            <button onClick={handleNovo} style={styles.buttonNovoEmpty}>
              + ADICIONAR VEÍCULO
            </button>
          </div>
        ) : (
          <>
            <div style={styles.cardsGrid}>
              {ordens.map((ordem) => (
                <div key={ordem.id} style={styles.cardOS}>
                  <div style={styles.cardHeader}>
                    <div>
                      <div style={styles.placa}>{ordem.placa}</div>
                      <div style={styles.modelo}>{ordem.modelo} - {ordem.ano}</div>
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={() => handleEditar(ordem.id)} style={styles.editBtn}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => handleDeletar(ordem.id)} style={styles.deleteBtn} disabled={ordemDeletando === ordem.id}>
                        <FontAwesomeIcon icon={faTrashAlt} spin={ordemDeletando === ordem.id} />
                      </button>
                    </div>
                  </div>

                  <div style={styles.clienteInfo}>
                    <FontAwesomeIcon icon={faUser} style={styles.iconSmall} />
                    <strong>{ordem.cliente?.nome || 'Cliente não encontrado'}</strong>
                    <div style={styles.telefone}>
                      <FontAwesomeIcon icon={faPhone} style={styles.iconTiny} />
                      {ordem.cliente?.telefone}
                    </div>
                  </div>

                  <div style={styles.detalhesServico}>
                    <div style={{
                      ...styles.departamentoBadge,
                      backgroundColor: ordem.departamento?.cor || '#6c757d'
                    }}>
                      {ordem.departamento?.nome || 'Não definido'}
                    </div>

                    <div style={styles.dataInfo}>
                      <div>
                        <FontAwesomeIcon icon={faCalendarAlt} style={styles.iconTiny} />
                        <span style={styles.dataLabel}>DATA DE ENTRADA</span>
                        <div>{formatarData(ordem.dataEntrada)}</div>
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faClock} style={styles.iconTiny} />
                        <span style={styles.dataLabel}>TEMPO DECORRIDO</span>
                        <div style={styles.tempoDecorrido}>{ordem.tempoDecorrido} DIAS</div>
                      </div>
                    </div>

                    <div style={styles.servicos}>
                      {ordem.servicosRealizar}
                    </div>
                  </div>

                  <div style={styles.cardFooter}>
                    <div style={styles.consultor}>
                      CONSULTOR: {ordem.consultorResponsavel}
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(ordem.status)
                    }}>
                      {getStatusTexto(ordem.status).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPaginas > 1 && (
              <div style={styles.paginacao}>
                <button
                  onClick={() => setPagina(pagina - 1)}
                  disabled={pagina === 1}
                  style={styles.buttonPagina}
                >
                  ANTERIOR
                </button>
                <span style={styles.paginaInfo}>
                  PÁGINA {pagina} DE {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina(pagina + 1)}
                  disabled={pagina === totalPaginas}
                  style={styles.buttonPagina}
                >
                  PRÓXIMA
                </button>
              </div>
            )}
          </>
        )}
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
    boxShadow: '0 0px 4px rgba(0,0,0,0.1)'
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
    padding: '24px',
    boxShadow: '0 0px 4px rgba(0,0,0,0.1)'
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    gap: '10px'
  },
  infoTitle: {
    fontSize: '20px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333',
    margin: 0
  },
  infoText: {
    fontSize: '15px',
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#666',
    margin: 0
  },
  searchContainer: {
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "Arial, Helvetica, sans-serif",
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box' as const
  },
  filtrosContainer: {
    display: 'flex',
    gap: '32px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap' as const
  },
  filtroGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    minWidth: '200px'
  },
  filtroLabel: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: '0.5px'
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontFamily: "Arial, Helvetica, sans-serif",
    outline: 'none'
  },
  buttonContainer: {
    marginBottom: '24px',
    textAlign: 'right' as const
  },
  buttonNovo: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  buttonNovoEmpty: {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    marginTop: '16px'
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px'
  },
  cardOS: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  cardHeader: {
    backgroundColor: '#fff',
    padding: '16px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  placa: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'monospace'
  },
  modelo: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    color: '#3498db'
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px',
    color: '#e74c3c'
  },
  clienteInfo: {
    padding: '16px',
    borderBottom: '1px solid #e9ecef',
    backgroundColor: '#fff'
  },
  telefone: {
    fontSize: '12px',
    color: '#7f8c8d',
    marginTop: '4px'
  },
  detalhesServico: {
    padding: '16px',
    backgroundColor: '#fff'
  },
  departamentoBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold',
    marginBottom: '12px'
  },
  dataInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e9ecef'
  },
  dataLabel: {
    fontSize: '10px',
    color: '#95a5a6',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    marginLeft: '4px'
  },
  tempoDecorrido: {
    fontWeight: 'bold',
    color: '#f39c12'
  },
  servicos: {
    fontSize: '13px',
    color: '#2c3e50',
    lineHeight: '1.5',
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px'
  },
  cardFooter: {
    padding: '12px 16px',
    borderTop: '1px solid #e9ecef',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  consultor: {
    fontSize: '11px',
    color: '#7f8c8d',
    fontWeight: 'bold'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#7f8c8d'
  },
  paginacao: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  buttonPagina: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  paginaInfo: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  iconSmall: {
    marginRight: '8px',
    color: '#7f8c8d'
  },
  iconTiny: {
    marginRight: '4px',
    fontSize: '10px',
    color: '#95a5a6'
  }
};

export default Dashboard;