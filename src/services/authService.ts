import api from './api';

interface LoginResponse {
  usuario: {
    id: number;
    nome: string;
    email: string;
    permissao: string;
    ativo: boolean;
  };
  token: string;
}

export const login = async (email: string, senha: string): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', { email, senha });
  return response.data;
};

export const cadastrarUsuario = async (dados: {
  nome: string;
  email: string;
  senha: string;
  permissao?: string;
}) => {
  const response = await api.post('/usuarios', dados);
  return response.data;
};