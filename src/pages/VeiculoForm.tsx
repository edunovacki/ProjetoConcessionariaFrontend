import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarVeiculo, atualizarVeiculo, buscarVeiculoPorId } from '../services/veiculoService';
import { listarClientes } from '../services/clienteService';
import { Cliente } from '../types/cliente';

interface FormData {
  placa: string;
  modelo: string;
  id_cliente: number;
}

const VeiculoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    placa: '',
    modelo: '',
    id_cliente: 0
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
          placa: veiculo.placa || '',
          modelo: veiculo.modelo || '',
          id_cliente: veiculo.id_cliente || 0
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let valorFormatado: any = value;
    
    if (name === 'placa') {
      valorFormatado = value.toUpperCase();
    } else if (name === 'id_cliente') {
      valorFormatado = parseInt(value);
    }
    
    setFormData({ ...formData, [name]: valorFormatado });
    
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

    if (!formData.placa || !formData.placa.trim()) {
      novosErros.placa = 'Placa é obrigatória';
    } else if (formData.placa.length < 7 || formData.placa.length > 8) {
      novosErros.placa = 'Placa deve ter 7 ou 8 caracteres';
    }

    if (!formData.modelo || !formData.modelo.trim()) {
      novosErros.modelo = 'Modelo é obrigatório';
    }

    if (!formData.id_cliente || formData.id_cliente === 0) {
      novosErros.id_cliente = 'Selecione um cliente';
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
      const dadosParaEnviar = {
        placa: formData.placa,
        modelo: formData.modelo,
        id_cliente: formData.id_cliente
      };

      if (isEdicao && id) {
        await atualizarVeiculo(parseInt(id), dadosParaEnviar);
        alert('Veículo atualizado com sucesso!');
      } else {
        await criarVeiculo(dadosParaEnviar);
        alert('Veículo cadastrado com sucesso!');
      }
      
      navigate('/veiculos');
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      alert(error.response?.data?.error || 'Erro ao salvar veículo. Tente novamente.');
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
            name="id_cliente"
            value={formData.id_cliente}
            onChange={handleChange}
            style={{...styles.select, borderColor: erros.id_cliente ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          >
            <option value={0}>Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome} - {cliente.cpf || 'Sem CPF'}
              </option>
            ))}
          </select>
          {erros.id_cliente && <span style={styles.errorText}>{erros.id_cliente}</span>}
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
            placeholder="Ex: Civic, Corolla, Onix"
          />
          {erros.modelo && <span style={styles.errorText}>{erros.modelo}</span>}
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
    color: '#333',
    fontFamily: "Arial, Helvetica, sans-serif"
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
  helperText: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
    fontFamily: "Arial, Helvetica, sans-serif",
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