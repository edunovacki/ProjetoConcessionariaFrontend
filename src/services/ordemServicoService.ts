import { OrdemServico, OrdemServicoFormData } from '../types/ordemServico';
import { buscarClientePorId } from './clienteService';
import { buscarVeiculoPorId } from './veiculoService';
import { buscarDepartamentoPorId } from './departamentoService';

let ordensServicoMock: OrdemServico[] = [
  {
    id: 1,
    numeroOS: 'OS-001',
    clienteId: 1,
    veiculoId: 1,
    departamentoId: 1,
    placa: 'Q8B9P',
    modelo: 'Civicão',
    marca: 'Honda',
    ano: 2029,
    cor: 'Prata',
    dataEntrada: '2025-02-03',
    dataPrevisao: '2025-02-28',
    status: 'em_andamento',
    servicosRealizar: 'Um amagadinho e uma raladinha na bindinha',
    observacoes: 'Cliente solicitou revisão completa',
    consultorResponsavel: 'Eduardo Novacki',
    tempoDecorrido: 25
  },
  {
    id: 2,
    numeroOS: 'OS-002',
    clienteId: 2,
    veiculoId: 2,
    departamentoId: 4,
    placa: 'SXJ4F79',
    modelo: 'Strada Ultra',
    marca: 'Fiat',
    ano: 2025,
    cor: 'Preto',
    dataEntrada: '2025-07-31',
    dataPrevisao: '2025-08-30',
    status: 'em_andamento',
    servicosRealizar: 'Colisão traseira, para-choque e etc',
    observacoes: 'Serviço de funilaria completo',
    consultorResponsavel: 'Gustavo',
    tempoDecorrido: 239
  }
];

const gerarNumeroOS = (): string => {
  const ano = new Date().getFullYear();
  const proximoNumero = ordensServicoMock.length + 1;
  return `OS-${ano}-${proximoNumero.toString().padStart(4, '0')}`;
};

const calcularTempoDecorrido = (dataEntrada: string): number => {
  const entrada = new Date(dataEntrada);
  const hoje = new Date();
  const diffTime = Math.abs(hoje.getTime() - entrada.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const buscarDadosCompletos = async (ordem: OrdemServico): Promise<OrdemServico> => {
  const cliente = await buscarClientePorId(ordem.clienteId);
  const veiculo = await buscarVeiculoPorId(ordem.veiculoId);
  const departamento = await buscarDepartamentoPorId(ordem.departamentoId);
  
  return {
    ...ordem,
    cliente: cliente || undefined,
    veiculo: veiculo || undefined,
    departamento: departamento || undefined,
    tempoDecorrido: calcularTempoDecorrido(ordem.dataEntrada)
  };
};

export const listarOrdensServico = async (
  pagina: number = 1,
  itensPorPagina: number = 5,
  filtroDepartamento?: number,
  filtroStatus?: string,
  busca?: string
): Promise<{ dados: OrdemServico[]; total: number }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Primeiro, buscar todas as ordens com dados completos
  const todasOrdensCompletas = await Promise.all(
    ordensServicoMock.map(ordem => buscarDadosCompletos(ordem))
  );
  
  let filtrados = [...todasOrdensCompletas];
  
  // Filtro por departamento
  if (filtroDepartamento && filtroDepartamento > 0) {
    filtrados = filtrados.filter(o => o.departamentoId === filtroDepartamento);
  }
  
  // Filtro por status
  if (filtroStatus && filtroStatus !== 'todas') {
    filtrados = filtrados.filter(o => o.status === filtroStatus);
  }
  
  // Filtro por busca (placa, modelo, cliente, número OS)
  if (busca && busca.trim() !== '') {
    const termoBusca = busca.toLowerCase().trim();
    filtrados = filtrados.filter(o => {
      // Buscar por placa
      if (o.placa.toLowerCase().includes(termoBusca)) return true;
      // Buscar por modelo
      if (o.modelo.toLowerCase().includes(termoBusca)) return true;
      // Buscar por número OS
      if (o.numeroOS.toLowerCase().includes(termoBusca)) return true;
      // Buscar por nome do cliente
      if (o.cliente?.nome.toLowerCase().includes(termoBusca)) return true;
      return false;
    });
  }
  
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPaginados = filtrados.slice(inicio, fim);
  
  return {
    dados: dadosPaginados,
    total: filtrados.length
  };
};

export const listarTodasOrdensServico = async (): Promise<OrdemServico[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.all(ordensServicoMock.map(o => buscarDadosCompletos(o)));
};

export const buscarOrdemServicoPorId = async (id: number): Promise<OrdemServico | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const ordem = ordensServicoMock.find(o => o.id === id);
  if (!ordem) return null;
  return buscarDadosCompletos(ordem);
};

export const criarOrdemServico = async (dados: OrdemServicoFormData): Promise<OrdemServico> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const novaOrdem: OrdemServico = {
    id: Math.max(...ordensServicoMock.map(o => o.id), 0) + 1,
    numeroOS: gerarNumeroOS(),
    ...dados,
    dataEntrada: new Date().toISOString().split('T')[0]
  };
  
  ordensServicoMock.push(novaOrdem);
  return buscarDadosCompletos(novaOrdem);
};

export const atualizarOrdemServico = async (id: number, dados: Partial<OrdemServicoFormData>): Promise<OrdemServico> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = ordensServicoMock.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Ordem de serviço não encontrada');
  
  ordensServicoMock[index] = { ...ordensServicoMock[index], ...dados };
  
  if (dados.status === 'concluido') {
    ordensServicoMock[index].dataConclusao = new Date().toISOString().split('T')[0];
  }
  
  return buscarDadosCompletos(ordensServicoMock[index]);
};

export const deletarOrdemServico = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = ordensServicoMock.findIndex(o => o.id === id);
  if (index === -1) throw new Error('Ordem de serviço não encontrada');
  
  ordensServicoMock.splice(index, 1);
};