import { Orcamento, OrcamentoFormData } from '../types/orcamento';
import { listarClientes } from './clienteService';
import { listarVeiculos } from './veiculoService';

// Dados mockados
let orcamentosMock: Orcamento[] = [
  {
    id: 1,
    clienteId: 1,
    veiculoId: 1,
    dataOrcamento: '2024-03-01',
    valorTotal: 125000,
    status: 'pendente',
    observacoes: 'Cliente solicitou revisão completa',
    dataValidade: '2024-04-01'
  },
  {
    id: 2,
    clienteId: 2,
    veiculoId: 2,
    dataOrcamento: '2024-03-05',
    valorTotal: 135000,
    status: 'aprovado',
    observacoes: 'Orçamento aprovado com entrada de 50%',
    dataValidade: '2024-04-05'
  },
  {
    id: 3,
    clienteId: 3,
    veiculoId: 3,
    dataOrcamento: '2024-03-10',
    valorTotal: 85000,
    status: 'recusado',
    observacoes: 'Cliente optou por outro veículo',
    dataValidade: '2024-04-10'
  }
];

// Função para buscar dados completos de um orçamento
const buscarDadosCompletos = async (orcamento: Orcamento): Promise<Orcamento> => {
  const clientesResponse = await listarClientes(1, 1000);
  const veiculosResponse = await listarVeiculos(1, 1000);
  
  const cliente = clientesResponse.dados.find(c => c.id === orcamento.clienteId);
  const veiculo = veiculosResponse.dados.find(v => v.id === orcamento.veiculoId);
  
  return {
    ...orcamento,
    cliente,
    veiculo
  };
};

// Função para listar orçamentos com paginação
export const listarOrcamentos = async (
  pagina: number = 1,
  itensPorPagina: number = 5
): Promise<{ dados: Orcamento[]; total: number }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPaginados = orcamentosMock.slice(inicio, fim);
  
  // Buscar dados completos para cada orçamento
  const dadosCompletos = await Promise.all(
    dadosPaginados.map(orcamento => buscarDadosCompletos(orcamento))
  );
  
  return {
    dados: dadosCompletos,
    total: orcamentosMock.length
  };
};

// Função para buscar orçamento por ID
export const buscarOrcamentoPorId = async (id: number): Promise<Orcamento | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const orcamento = orcamentosMock.find(o => o.id === id);
  if (!orcamento) return null;
  
  return buscarDadosCompletos(orcamento);
};

// Função para criar orçamento
export const criarOrcamento = async (dados: OrcamentoFormData): Promise<Orcamento> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const novoOrcamento: Orcamento = {
    id: Math.max(...orcamentosMock.map(o => o.id), 0) + 1,
    ...dados,
    dataOrcamento: new Date().toISOString().split('T')[0]
  };
  
  orcamentosMock.push(novoOrcamento);
  return buscarDadosCompletos(novoOrcamento);
};

// Função para atualizar orçamento
export const atualizarOrcamento = async (id: number, dados: Partial<OrcamentoFormData>): Promise<Orcamento> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = orcamentosMock.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error('Orçamento não encontrado');
  }
  
  orcamentosMock[index] = {
    ...orcamentosMock[index],
    ...dados
  };
  
  return buscarDadosCompletos(orcamentosMock[index]);
};

// Função para deletar orçamento
export const deletarOrcamento = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = orcamentosMock.findIndex(o => o.id === id);
  if (index === -1) {
    throw new Error('Orçamento não encontrado');
  }
  
  orcamentosMock.splice(index, 1);
};

// Função para buscar orçamentos por cliente
export const buscarOrcamentosPorCliente = async (clienteId: number): Promise<Orcamento[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const orcamentos = orcamentosMock.filter(o => o.clienteId === clienteId);
  return Promise.all(orcamentos.map(o => buscarDadosCompletos(o)));
};

// Função para buscar orçamentos por veículo
export const buscarOrcamentosPorVeiculo = async (veiculoId: number): Promise<Orcamento[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const orcamentos = orcamentosMock.filter(o => o.veiculoId === veiculoId);
  return Promise.all(orcamentos.map(o => buscarDadosCompletos(o)));
};