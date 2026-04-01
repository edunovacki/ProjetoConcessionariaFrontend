import api from './api';
import { Cliente, ClienteFormData } from '../types/cliente';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const listarClientes = async (
  pagina: number = 1,
  itensPorPagina: number = 5
): Promise<{ dados: Cliente[]; total: number }> => {
  const response = await api.get<PaginatedResponse<Cliente>>('/clientes', {
    params: { page: pagina, limit: itensPorPagina }
  });
  
  return {
    dados: response.data.data,
    total: response.data.total
  };
};

export const buscarClientePorId = async (id: number): Promise<Cliente | null> => {
  const response = await api.get(`/clientes/${id}`);
  return response.data.data || response.data;
};

export const criarCliente = async (dados: ClienteFormData): Promise<Cliente> => {
  const response = await api.post('/clientes', dados);
  return response.data.data || response.data;
};

export const atualizarCliente = async (id: number, dados: Partial<ClienteFormData>): Promise<Cliente> => {
  const response = await api.put(`/clientes/${id}`, dados);
  return response.data.data || response.data;
};

export const deletarCliente = async (id: number): Promise<void> => {
  await api.delete(`/clientes/${id}`);
};