export interface Departamento {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  ativo: boolean;
  dataCadastro: string;
}

export interface DepartamentoFormData {
  nome: string;
  descricao: string;
  cor: string;
}