import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarOrcamento, atualizarOrcamento, buscarOrcamentoPorId } from '../services/orcamentoService';
import { listarClientes } from '../services/clienteService';
import { listarVeiculos } from '../services/veiculoService';
import { Cliente } from '../types/cliente';
import { Veiculo } from '../types/veiculo';
import { formatarMoeda, moedaParaNumero, formatarMoedaDigitacao } from '../utils/validations';

interface FormData {
  clienteId: number;
  veiculoId: number;
  valorTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado';
  observacoes: string;
  dataValidade: string;
}

const OrcamentoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    clienteId: 0,
    veiculoId: 0,
    valorTotal: 0,
    status: 'pendente',
    observacoes: '',
    dataValidade: ''
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [precoDisplay, setPrecoDisplay] = useState<string>('');
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // Carregar clientes, veículos e dados do orçamento
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      // Carregar clientes e veículos
      const clientesResponse = await listarClientes(1, 1000);
      const veiculosResponse = await listarVeiculos(1, 1000);
      setClientes(clientesResponse.dados);
      setVeiculos(veiculosResponse.dados);

      // Se for edição, carregar dados do orçamento
      if (isEdicao && id) {
        const orcamento = await buscarOrcamentoPorId(parseInt(id));
        if (orcamento) {
          setFormData({
            clienteId: orcamento.clienteId,
            veiculoId: orcamento.veiculoId,
            valorTotal: orcamento.valorTotal,
            status: orcamento.status,
            observacoes: orcamento.observacoes,
            dataValidade: orcamento.dataValidade
          });
          setPrecoDisplay(formatarMoeda(orcamento.valorTotal));
          
          // Buscar veículo selecionado
          const veiculo = veiculosResponse.dados.find(v => v.id === orcamento.veiculoId);
          if (veiculo) {
            setVeiculoSelecionado(veiculo);
          }
        } else {
          alert('Orçamento não encontrado');
          navigate('/orcamentos');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = parseInt(e.target.value);
    setFormData({ ...formData, clienteId });
    if (erros.clienteId) {
      setErros({ ...erros, clienteId: '' });
    }
  };

  const handleVeiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const veiculoId = parseInt(e.target.value);
    const veiculo = veiculos.find(v => v.id === veiculoId);
    setVeiculoSelecionado(veiculo || null);
    setFormData({ ...formData, veiculoId });
    
    // Se o veículo estiver disponível, sugerir o valor como preço padrão
    if (veiculo && veiculo.status === 'disponivel') {
      setFormData(prev => ({ ...prev, valorTotal: veiculo.preco }));
      setPrecoDisplay(formatarMoeda(veiculo.preco));
    }
    
    if (erros.veiculoId) {
      setErros({ ...erros, veiculoId: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'valorTotal') {
      const valorFormatado = formatarMoedaDigitacao(value);
      setPrecoDisplay(valorFormatado);
      const valorNumerico = moedaParaNumero(valorFormatado);
      setFormData({ ...formData, valorTotal: valorNumerico });
      
      if (erros.valorTotal) {
        setErros({ ...erros, valorTotal: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      if (erros[name]) {
        setErros({ ...erros, [name]: '' });
      }
    }
  };

  const handlePrecoFocus = () => {
    if (formData.valorTotal > 0) {
      setPrecoDisplay(formData.valorTotal.toString());
    }
  };

  const handlePrecoBlur = () => {
    if (formData.valorTotal > 0) {
      setPrecoDisplay(formatarMoeda(formData.valorTotal));
    } else {
      setPrecoDisplay('');
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.clienteId || formData.clienteId === 0) {
      novosErros.clienteId = 'Selecione um cliente';
    }

    if (!formData.veiculoId || formData.veiculoId === 0) {
      novosErros.veiculoId = 'Selecione um veículo';
    }

    if (!formData.valorTotal || formData.valorTotal <= 0) {
      novosErros.valorTotal = 'Valor deve ser maior que zero';
    }

    if (!formData.dataValidade) {
      novosErros.dataValidade = 'Data de validade é obrigatória';
    } else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataValidade = new Date(formData.dataValidade);
      
      if (dataValidade <= hoje) {
        novosErros.dataValidade = 'Data de validade deve ser futura';
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setCarregando(true);

    try {
      if (isEdicao && id) {
        await atualizarOrcamento(parseInt(id), formData);
        alert('Orçamento atualizado com sucesso!');
      } else {
        await criarOrcamento(formData);
        alert('Orçamento criado com sucesso!');
      }
      
      navigate('/orcamentos');
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return <div style={styles.loading}>Carregando dados...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>
        {isEdicao ? 'Editar Orçamento' : 'Novo Orçamento'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cliente:*</label>
          <select
            name="clienteId"
            value={formData.clienteId}
            onChange={handleClienteChange}
            style={{...styles.select, borderColor: erros.clienteId ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          >
            <option value={0}>Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} - {cliente.cpf}
              </option>
            ))}
          </select>
          {erros.clienteId && <span style={styles.errorText}>{erros.clienteId}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Veículo:*</label>
          <select
            name="veiculoId"
            value={formData.veiculoId}
            onChange={handleVeiculoChange}
            style={{...styles.select, borderColor: erros.veiculoId ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          >
            <option value={0}>Selecione um veículo</option>
            {veiculos.map(veiculo => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.modelo} - {veiculo.marca} ({veiculo.ano}) - {veiculo.placa}
              </option>
            ))}
          </select>
          {erros.veiculoId && <span style={styles.errorText}>{erros.veiculoId}</span>}
        </div>

        {veiculoSelecionado && (
          <div style={styles.infoBox}>
            <strong>Informações do Veículo Selecionado:</strong>
            <p>Modelo: {veiculoSelecionado.modelo}</p>
            <p>Marca: {veiculoSelecionado.marca}</p>
            <p>Ano: {veiculoSelecionado.ano}</p>
            <p>Cor: {veiculoSelecionado.cor}</p>
            <p>Status: {veiculoSelecionado.status === 'disponivel' ? 'Disponível' : 'Indisponível'}</p>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Valor Total:*</label>
          <input
            type="text"
            name="valorTotal"
            value={precoDisplay}
            onChange={handleChange}
            onFocus={handlePrecoFocus}
            onBlur={handlePrecoBlur}
            style={{...styles.input, borderColor: erros.valorTotal ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="R$ 0,00"
          />
          {erros.valorTotal && <span style={styles.errorText}>{erros.valorTotal}</span>}
          <span style={styles.helperText}>Digite apenas números - formatação automática</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status:*</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
            disabled={carregando}
          >
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Data de Validade:*</label>
          <input
            type="date"
            name="dataValidade"
            value={formData.dataValidade}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.dataValidade ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          />
          {erros.dataValidade && <span style={styles.errorText}>{erros.dataValidade}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Observações:</label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            style={styles.textarea}
            disabled={carregando}
            rows={4}
            placeholder="Observações sobre o orçamento..."
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/orcamentos')}
            style={styles.buttonCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={styles.buttonSalvar}
            disabled={carregando}
          >
            {carregando ? 'Salvando...' : (isEdicao ? 'Atualizar' : 'Cadastrar')}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  title: {
    marginBottom: '24px',
    color: '#333'
  },
  form: {
    maxWidth: '700px',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px'
  },
  formGroup: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    transition: 'border-color 0.3s'
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    backgroundColor: 'white'
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical' as const
  },
  helperText: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '4px'
  },
  infoBox: {
    backgroundColor: '#e7f3ff',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #007bff'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '24px'
  },
  buttonSalvar: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  buttonCancelar: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '18px',
    color: '#666'
  }
};

export default OrcamentoForm;