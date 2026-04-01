import api from './api';
import { OrdemServico, OrdemServicoFormData } from '../types/ordemServico';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mapear os campos do back-end para o front-end
const mapearOrdem = (orcamento: any): OrdemServico => {
  return {
    id: orcamento.id,
    numeroOS: `OS-${orcamento.id}`,
    clienteId: orcamento.id_cliente,
    cliente: orcamento.clientes,
    veiculoId: orcamento.id_veiculo,
    veiculo: orcamento.veiculos,
    departamentoId: orcamento.veiculos?.id_departamento || 1,
    departamento: orcamento.veiculos?.departamentos,
    placa: orcamento.veiculos?.placa || '',
    modelo: orcamento.veiculos?.modelo || '',
    marca: orcamento.veiculos?.modelo?.split(' ')[0] || '',
    ano: new Date().getFullYear(),
    cor: '',
    dataEntrada: orcamento.data_inicio ? new Date(orcamento.data_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dataPrevisao: orcamento.data_termino ? new Date(orcamento.data_termino).toISOString().split('T')[0] : '',
    status: orcamento.etapa === 'concluido' ? 'concluido' : 
            orcamento.etapa === 'aguardando_retirada' ? 'aguardando_retirada' : 'em_andamento',
    servicosRealizar: orcamento.descricao || '',
    observacoes: '',
    consultorResponsavel: orcamento.usuarios?.nome || 'Sistema',
    tempoDecorrido: calcularTempoDecorrido(orcamento.data_inicio)
  };
};

const calcularTempoDecorrido = (dataEntrada: string | Date): number => {
  if (!dataEntrada) return 0;
  const entrada = new Date(dataEntrada);
  const hoje = new Date();
  const diffTime = Math.abs(hoje.getTime() - entrada.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const listarOrdensServico = async (
  pagina: number = 1,
  itensPorPagina: number = 5,
  filtroDepartamento?: number,
  filtroStatus?: string,
  busca?: string
): Promise<{ dados: OrdemServico[]; total: number }> => {
  const params: any = { page: pagina, limit: itensPorPagina };
  
  if (filtroStatus && filtroStatus !== 'todas') {
    params.etapa = filtroStatus;
  }
  
  const response = await api.get<PaginatedResponse<any>>('/orcamentos', { params });
  
  let dados = response.data.data.map(mapearOrdem);
  
  // Filtro por departamento (front-end, pois o back-end não tem esse filtro)
  if (filtroDepartamento && filtroDepartamento > 0) {
    dados = dados.filter(o => o.departamentoId === filtroDepartamento);
  }
  
  // Filtro por busca
  if (busca && busca.trim() !== '') {
    const termoBusca = busca.toLowerCase().trim();
    dados = dados.filter(o => 
      o.placa.toLowerCase().includes(termoBusca) ||
      o.modelo.toLowerCase().includes(termoBusca) ||
      o.numeroOS.toLowerCase().includes(termoBusca) ||
      o.cliente?.nome.toLowerCase().includes(termoBusca)
    );
  }
  
  return {
    dados,
    total: dados.length
  };
};

export const listarTodasOrdensServico = async (): Promise<OrdemServico[]> => {
  const response = await api.get<PaginatedResponse<any>>('/orcamentos', { params: { limit: 1000 } });
  return response.data.data.map(mapearOrdem);
};

export const buscarOrdemServicoPorId = async (id: number): Promise<OrdemServico | null> => {
  const response = await api.get(`/orcamentos/${id}`);
  const orcamento = response.data.data || response.data;
  return mapearOrdem(orcamento);
};

export const criarOrdemServico = async (dados: OrdemServicoFormData): Promise<OrdemServico> => {
  const payload = {
    id_cliente: dados.clienteId,
    id_veiculo: dados.veiculoId,
    etapa: dados.status,
    descricao: dados.servicosRealizar,
    data_inicio: dados.dataEntrada,
    data_termino: dados.dataPrevisao
  };
  
  const response = await api.post('/orcamentos', payload);
  return mapearOrdem(response.data.data || response.data);
};

export const atualizarOrdemServico = async (id: number, dados: Partial<OrdemServicoFormData>): Promise<OrdemServico> => {
  const payload: any = {};
  
  if (dados.status) payload.etapa = dados.status;
  if (dados.servicosRealizar) payload.descricao = dados.servicosRealizar;
  if (dados.dataPrevisao) payload.data_termino = dados.dataPrevisao;
  if (dados.clienteId) payload.id_cliente = dados.clienteId;
  if (dados.veiculoId) payload.id_veiculo = dados.veiculoId;
  
  const response = await api.put(`/orcamentos/${id}`, payload);
  return mapearOrdem(response.data.data || response.data);
};

export const deletarOrdemServico = async (id: number): Promise<void> => {
  await api.delete(`/orcamentos/${id}`);
};