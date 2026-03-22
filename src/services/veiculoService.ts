import { Veiculo, VeiculoFormData } from '../types/veiculo';

// Função para formatar placa
const formatarPlaca = (placa: string): string => {
  placa = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (placa.length === 7) {
    // Formato antigo: ABC-1234
    return `${placa.slice(0, 3)}-${placa.slice(3, 7)}`;
  } else if (placa.length === 8) {
    // Formato Mercosul: ABC1D23
    return `${placa.slice(0, 3)}${placa.slice(3, 4)}${placa.slice(4, 5)}${placa.slice(5, 7)}`;
  }
  
  return placa;
};

// Dados mockados
let veiculosMock: Veiculo[] = [
  {
    id: 1,
    modelo: 'Civic',
    marca: 'Honda',
    ano: 2023,
    placa: 'ABC-1234',
    cor: 'Prata',
    preco: 125000,
    status: 'disponivel',
    dataCadastro: '2024-01-10'
  },
  {
    id: 2,
    modelo: 'Corolla',
    marca: 'Toyota',
    ano: 2023,
    placa: 'DEF-5678',
    cor: 'Branco',
    preco: 135000,
    status: 'disponivel',
    dataCadastro: '2024-01-15'
  },
  {
    id: 3,
    modelo: 'Onix',
    marca: 'Chevrolet',
    ano: 2024,
    placa: 'GHI-9012',
    cor: 'Vermelho',
    preco: 85000,
    status: 'vendido',
    dataCadastro: '2024-02-01'
  }
];

// Função para listar veículos com paginação
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

// Função para buscar veículo por ID
export const buscarVeiculoPorId = async (id: number): Promise<Veiculo | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const veiculo = veiculosMock.find(v => v.id === id);
  return veiculo || null;
};

// Função para criar veículo
export const criarVeiculo = async (dados: VeiculoFormData): Promise<Veiculo> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const placaFormatada = formatarPlaca(dados.placa);
  
  const novoVeiculo: Veiculo = {
    id: Math.max(...veiculosMock.map(v => v.id), 0) + 1,
    ...dados,
    placa: placaFormatada,
    dataCadastro: new Date().toISOString().split('T')[0]
  };
  
  veiculosMock.push(novoVeiculo);
  return novoVeiculo;
};

// Função para atualizar veículo
export const atualizarVeiculo = async (id: number, dados: Partial<VeiculoFormData>): Promise<Veiculo> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = veiculosMock.findIndex(v => v.id === id);
  if (index === -1) {
    throw new Error('Veículo não encontrado');
  }
  
  const dadosAtualizados = { ...dados };
  if (dadosAtualizados.placa) {
    dadosAtualizados.placa = formatarPlaca(dadosAtualizados.placa);
  }
  
  veiculosMock[index] = {
    ...veiculosMock[index],
    ...dadosAtualizados
  };
  
  return veiculosMock[index];
};

// Função para deletar veículo
export const deletarVeiculo = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = veiculosMock.findIndex(v => v.id === id);
  if (index === -1) {
    throw new Error('Veículo não encontrado');
  }
  
  veiculosMock.splice(index, 1);
};