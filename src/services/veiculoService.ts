import { Veiculo, VeiculoFormData } from '../types/veiculo';
import { buscarClientePorId } from './clienteService';

const formatarPlaca = (placa: string): string => {
  placa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (placa.length === 7) {
    return `${placa.slice(0, 3)}-${placa.slice(3, 7)}`;
  } else if (placa.length === 8) {
    return `${placa.slice(0, 3)}${placa.slice(3, 4)}${placa.slice(4, 5)}${placa.slice(5, 7)}`;
  }
  
  return placa;
};

let veiculosMock: Veiculo[] = [
  {
    id: 1,
    placa: 'Q8B9P',
    modelo: 'Civicão',
    marca: 'Honda',
    ano: 2029,
    cor: 'Prata',
    clienteId: 1,
    observacoes: 'Um amagadinho e uma raladinha na bindinha',
    dataCadastro: '2025-02-03'
  },
  {
    id: 2,
    placa: 'SXJ4F79',
    modelo: 'Strada Ultra',
    marca: 'Fiat',
    ano: 2025,
    cor: 'Preto',
    clienteId: 2,
    observacoes: 'Colisão traseira, para-choque e etc',
    dataCadastro: '2025-07-31'
  }
];

export const listarVeiculos = async (
  pagina: number = 1,
  itensPorPagina: number = 5
): Promise<{ dados: Veiculo[]; total: number }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dados = veiculosMock.slice(inicio, fim);
  
  return {
    dados,
    total: veiculosMock.length
  };
};

export const listarTodosVeiculos = async (): Promise<Veiculo[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return veiculosMock;
};

export const buscarVeiculoPorId = async (id: number): Promise<Veiculo | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return veiculosMock.find(v => v.id === id) || null;
};

export const buscarVeiculosPorCliente = async (clienteId: number): Promise<Veiculo[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return veiculosMock.filter(v => v.clienteId === clienteId);
};

export const criarVeiculo = async (dados: VeiculoFormData): Promise<Veiculo> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const placaFormatada = formatarPlaca(dados.placa);
  
  const cliente = await buscarClientePorId(dados.clienteId);
  if (!cliente) throw new Error('Cliente não encontrado');
  
  const novoVeiculo: Veiculo = {
    id: Math.max(...veiculosMock.map(v => v.id), 0) + 1,
    ...dados,
    placa: placaFormatada,
    dataCadastro: new Date().toISOString().split('T')[0]
  };
  
  veiculosMock.push(novoVeiculo);
  return novoVeiculo;
};

export const atualizarVeiculo = async (id: number, dados: Partial<VeiculoFormData>): Promise<Veiculo> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = veiculosMock.findIndex(v => v.id === id);
  if (index === -1) throw new Error('Veículo não encontrado');
  
  const dadosAtualizados = { ...dados };
  if (dadosAtualizados.placa) {
    dadosAtualizados.placa = formatarPlaca(dadosAtualizados.placa);
  }
  
  veiculosMock[index] = { ...veiculosMock[index], ...dadosAtualizados };
  return veiculosMock[index];
};

export const deletarVeiculo = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = veiculosMock.findIndex(v => v.id === id);
  if (index === -1) throw new Error('Veículo não encontrado');
  
  veiculosMock.splice(index, 1);
};