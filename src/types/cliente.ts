import { Veiculo } from './veiculo';

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
  dataCadastro: string;
  veiculos?: Veiculo[];
}

export interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  endereco: string;
}