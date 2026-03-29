export interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  clienteId: number;
  observacoes?: string;
  dataCadastro: string;
}

export interface VeiculoFormData {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  clienteId: number;
  observacoes?: string;
}