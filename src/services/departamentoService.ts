import { Departamento, DepartamentoFormData } from '../types/departamento';

// Dados mockados para departamentos (enquanto o back-end não tem esse endpoint)
let departamentosMock: Departamento[] = [
  {
    id: 1,
    nome: 'Funilaria',
    descricao: 'Reparos e pintura de lataria',
    cor: '#dc3545',
    ativo: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 2,
    nome: 'Pintura',
    descricao: 'Pintura automotiva',
    cor: '#28a745',
    ativo: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 3,
    nome: 'Mecânica',
    descricao: 'Serviços mecânicos em geral',
    cor: '#007bff',
    ativo: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 4,
    nome: 'Auto Santos',
    descricao: 'Serviços especializados',
    cor: '#ffc107',
    ativo: true,
    dataCadastro: '2024-01-01'
  },
  {
    id: 5,
    nome: 'Maquinaria',
    descricao: 'Serviços em máquinas pesadas',
    cor: '#6c757d',
    ativo: true,
    dataCadastro: '2024-01-01'
  }
];

export const listarDepartamentos = async (): Promise<Departamento[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return departamentosMock.filter(d => d.ativo);
};

export const buscarDepartamentoPorId = async (id: number): Promise<Departamento | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return departamentosMock.find(d => d.id === id) || null;
};

export const criarDepartamento = async (dados: DepartamentoFormData): Promise<Departamento> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const novoDepartamento: Departamento = {
    id: Math.max(...departamentosMock.map(d => d.id), 0) + 1,
    ...dados,
    ativo: true,
    dataCadastro: new Date().toISOString().split('T')[0]
  };
  
  departamentosMock.push(novoDepartamento);
  return novoDepartamento;
};

export const atualizarDepartamento = async (id: number, dados: Partial<DepartamentoFormData>): Promise<Departamento> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = departamentosMock.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Departamento não encontrado');
  
  departamentosMock[index] = { ...departamentosMock[index], ...dados };
  return departamentosMock[index];
};

export const deletarDepartamento = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = departamentosMock.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Departamento não encontrado');
  
  departamentosMock[index].ativo = false;
};