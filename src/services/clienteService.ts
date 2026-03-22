import { Cliente, ClienteFormData } from '../types/cliente';

// Função para formatar CPF
const formatarCPF = (cpf: string): string => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

// Dados mockados com CPF já formatado
let clientesMock: Cliente[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    cpf: '529.982.247-25', // CPF já formatado
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    dataCadastro: '2024-01-15'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 88888-8888',
    cpf: '123.456.789-00', // CPF já formatado
    endereco: 'Av. Principal, 456 - São Paulo, SP',
    dataCadastro: '2024-02-20'
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro@email.com',
    telefone: '(11) 77777-7777',
    cpf: '987.654.321-00', // CPF já formatado
    endereco: 'Rua dos Pinheiros, 789 - São Paulo, SP',
    dataCadastro: '2024-03-10'
  }
];

// Função para listar clientes com paginação
export const listarClientes = async (
  pagina: number = 1,
  itensPorPagina: number = 5
): Promise<{ dados: Cliente[]; total: number }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const inicio = (pagina - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dados = clientesMock.slice(inicio, fim);
  
  return {
    dados,
    total: clientesMock.length
  };
};

// Função para buscar cliente por ID
export const buscarClientePorId = async (id: number): Promise<Cliente | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const cliente = clientesMock.find(c => c.id === id);
  return cliente || null;
};

// Função para criar cliente
export const criarCliente = async (dados: ClienteFormData): Promise<Cliente> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Formatar CPF antes de salvar
  const cpfFormatado = formatarCPF(dados.cpf);
  
  const novoCliente: Cliente = {
    id: Math.max(...clientesMock.map(c => c.id), 0) + 1,
    ...dados,
    cpf: cpfFormatado, // Salva o CPF formatado
    dataCadastro: new Date().toISOString().split('T')[0]
  };
  
  clientesMock.push(novoCliente);
  return novoCliente;
};

// Função para atualizar cliente
export const atualizarCliente = async (id: number, dados: Partial<ClienteFormData>): Promise<Cliente> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = clientesMock.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Cliente não encontrado');
  }
  
  // Se tiver CPF nos dados, formatar antes de salvar
  const dadosFormatados = { ...dados };
  if (dadosFormatados.cpf) {
    dadosFormatados.cpf = formatarCPF(dadosFormatados.cpf);
  }
  
  clientesMock[index] = {
    ...clientesMock[index],
    ...dadosFormatados
  };
  
  return clientesMock[index];
};

// Função para deletar cliente
export const deletarCliente = async (id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = clientesMock.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Cliente não encontrado');
  }
  
  clientesMock.splice(index, 1);
};