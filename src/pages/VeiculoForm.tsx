import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarVeiculo, atualizarVeiculo, buscarVeiculoPorId } from '../services/veiculoService';
import { listarClientes } from '../services/clienteService';
import { Cliente } from '../types/cliente';
import { formatarPlaca } from '../utils/validations';

interface FormData {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  clienteId: number;
  observacoes: string;
}

const VeiculoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    placa: '',
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    cor: '',
    clienteId: 0,
    observacoes: ''
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(isEdicao);

  useEffect(() => {
    carregarClientes();
    if (isEdicao && id) {
      carregarVeiculo(parseInt(id));
    }
  }, [id, isEdicao]);

  const carregarClientes = async () => {
    try {
      const response = await listarClientes(1, 1000);
      setClientes(response.dados);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const carregarVeiculo = async (veiculoId: number) => {
    try {
      const veiculo = await buscarVeiculoPorId(veiculoId);
      if (veiculo) {
        setFormData({
          placa: veiculo.placa,
          modelo: veiculo.modelo,
          marca: veiculo.marca,
          ano: veiculo.ano,
          cor: veiculo.cor,
          clienteId: veiculo.clienteId,
          observacoes: veiculo.observacoes || ''
        });
      } else {
        alert('Veículo não encontrado');
        navigate('/veiculos');
      }
    } catch (error) {
      console.error('Erro ao carregar veículo:', error);
      alert('Erro ao carregar dados do veículo');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let valorFormatado: any = value;
    
    if (name === 'ano') {
      valorFormatado = parseInt(value) || new Date().getFullYear();
    } else if (name === 'placa') {
      valorFormatado = value.toUpperCase();
    } else if (name === 'clienteId') {
      valorFormatado = parseInt(value);
    }
    
    setFormData({ ...formData, [name]: valorFormatado });
    
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.placa.trim()) {
      novosErros.placa = 'Placa é obrigatória';
    } else if (formData.placa.length < 7 || formData.placa.length > 8) {
      novosErros.placa = 'Placa deve ter 7 ou 8 caracteres';
    }

    if (!formData.modelo.trim()) {
      novosErros.modelo = 'Modelo é obrigatório';
    }

    if (!formData.marca.trim()) {
      novosErros.marca = 'Marca é obrigatória';
    }

    const anoAtual = new Date().getFullYear();
    if (!formData.ano) {
      novosErros.ano = 'Ano é obrigatório';
    } else if (formData.ano < 1950 || formData.ano > anoAtual + 1) {
      novosErros.ano = `Ano deve estar entre 1950 e ${anoAtual + 1}`;
    }

    if (!formData.cor.trim()) {
      novosErros.cor = 'Cor é obrigatória';
    }

    if (!formData.clienteId || formData.clienteId === 0) {
      novosErros.clienteId = 'Selecione um cliente';
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
        await atualizarVeiculo(parseInt(id), formData);
        alert('Veículo atualizado com sucesso!');
      } else {
        await criarVeiculo(formData);
        alert('Veículo cadastrado com sucesso!');
      }
      
      navigate('/veiculos');
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoDados) {
    return <div style={styles.loading}>Carregando dados do veículo...</div>;
  }

  return (
    <div>
      <h2 style={styles.title}>
        {isEdicao ? 'Editar Veículo' : 'Novo Veículo'}
      </h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Cliente:*</label>
          <select
            name="clienteId"
            value={formData.clienteId}
            onChange={handleChange}
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
          <label style={styles.label}>Placa:*</label>
          <input
            type="text"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.placa ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="ABC-1234 ou ABC1D23"
            maxLength={8}
          />
          {erros.placa && <span style={styles.errorText}>{erros.placa}</span>}
          <span style={styles.helperText}>Formato: ABC-1234 (antigo) ou ABC1D23 (Mercosul)</span>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Modelo:*</label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.modelo ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          />
          {erros.modelo && <span style={styles.errorText}>{erros.modelo}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Marca:*</label>
          <input
            type="text"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.marca ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          />
          {erros.marca && <span style={styles.errorText}>{erros.marca}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Ano:*</label>
          <input
            type="number"
            name="ano"
            value={formData.ano}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.ano ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          />
          {erros.ano && <span style={styles.errorText}>{erros.ano}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Cor:*</label>
          <input
            type="text"
            name="cor"
            value={formData.cor}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.cor ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          />
          {erros.cor && <span style={styles.errorText}>{erros.cor}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Observações:</label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            style={styles.textarea}
            disabled={carregando}
            rows={3}
            placeholder="Observações sobre o veículo..."
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/veiculos')}
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
    maxWidth: '600px',
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

export default VeiculoForm;