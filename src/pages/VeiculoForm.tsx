import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarVeiculo, atualizarVeiculo, buscarVeiculoPorId } from '../services/veiculoService';
import { formatarMoeda, moedaParaNumero, formatarMoedaDigitacao } from '../utils/validations';

interface FormData {
  modelo: string;
  marca: string;
  ano: number;
  placa: string;
  cor: string;
  preco: number;
  status: 'disponivel' | 'vendido' | 'reservado';
}

const VeiculoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    placa: '',
    cor: '',
    preco: 0,
    status: 'disponivel'
  });
  
  const [precoDisplay, setPrecoDisplay] = useState<string>('');
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(isEdicao);

  useEffect(() => {
    if (isEdicao && id) {
      carregarVeiculo(parseInt(id));
    }
  }, [id, isEdicao]);

  const carregarVeiculo = async (veiculoId: number) => {
    try {
      const veiculo = await buscarVeiculoPorId(veiculoId);
      if (veiculo) {
        setFormData({
          modelo: veiculo.modelo,
          marca: veiculo.marca,
          ano: veiculo.ano,
          placa: veiculo.placa,
          cor: veiculo.cor,
          preco: veiculo.preco,
          status: veiculo.status
        });
        // Formatar o preço para exibição
        setPrecoDisplay(formatarMoeda(veiculo.preco));
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
    
    if (name === 'preco') {
      // Formata o preço enquanto digita
      const valorFormatado = formatarMoedaDigitacao(value);
      setPrecoDisplay(valorFormatado);
      
      // Converte para número e salva no formData
      const valorNumerico = moedaParaNumero(valorFormatado);
      setFormData({ ...formData, preco: valorNumerico });
      
      // Limpa erro do campo
      if (erros.preco) {
        setErros({ ...erros, preco: '' });
      }
    } else {
      let valorFormatado: any = value;
      
      if (name === 'ano') {
        valorFormatado = parseInt(value) || new Date().getFullYear();
      } else if (name === 'placa') {
        valorFormatado = value.toUpperCase();
      }
      
      setFormData({ ...formData, [name]: valorFormatado });
      
      if (erros[name]) {
        setErros({ ...erros, [name]: '' });
      }
    }
  };

  const handlePrecoFocus = () => {
    // Quando o campo recebe foco, mostra apenas os números
    if (formData.preco > 0) {
      setPrecoDisplay(formData.preco.toString());
    }
  };

  const handlePrecoBlur = () => {
    // Quando perde o foco, formata como moeda
    if (formData.preco > 0) {
      setPrecoDisplay(formatarMoeda(formData.preco));
    } else {
      setPrecoDisplay('');
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: { [key: string]: string } = {};

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

    if (!formData.placa.trim()) {
      novosErros.placa = 'Placa é obrigatória';
    } else if (formData.placa.length < 7 || formData.placa.length > 8) {
      novosErros.placa = 'Placa deve ter 7 ou 8 caracteres';
    }

    if (!formData.cor.trim()) {
      novosErros.cor = 'Cor é obrigatória';
    }

    if (!formData.preco || formData.preco <= 0) {
      novosErros.preco = 'Preço deve ser maior que zero';
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
          <label style={styles.label}>Preço:*</label>
          <input
            type="text"
            name="preco"
            value={precoDisplay}
            onChange={handleChange}
            onFocus={handlePrecoFocus}
            onBlur={handlePrecoBlur}
            style={{...styles.input, borderColor: erros.preco ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="R$ 0,00"
          />
          {erros.preco && <span style={styles.errorText}>{erros.preco}</span>}
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
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
          </select>
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