import { Cliente } from './cliente';
import { Veiculo } from './veiculo';

export interface Orcamento {
  id: number;
  clienteId: number;
  cliente?: Cliente; // Dados completos do cliente (opcional)
  veiculoId: number;
  veiculo?: Veiculo; // Dados completos do veículo (opcional)
  dataOrcamento: string;
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado';
  observacoes: string;
  dataValidade: string;
}

export interface OrcamentoFormData {
  clienteId: number;
  veiculoId: number;
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado';
  observacoes: string;
  dataValidade: string;
}