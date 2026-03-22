export interface Veiculo {
  id: number;
  modelo: string;
  marca: string;
  ano: number;
  placa: string;
  cor: string;
  preco: number;
  status: 'disponivel' | 'vendido' | 'reservado';
  dataCadastro: string;
}

export interface VeiculoFormData {
  modelo: string;
  marca: string;
  ano: number;
  placa: string;
  cor: string;
  preco: number;
  status: 'disponivel' | 'vendido' | 'reservado';
}