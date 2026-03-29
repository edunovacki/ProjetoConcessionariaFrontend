export interface User {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}