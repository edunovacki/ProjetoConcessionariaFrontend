import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarOrdemServico, atualizarOrdemServico, buscarOrdemServicoPorId } from '../services/ordemServicoService';
import { listarClientes } from '../services/clienteService';
import { listarTodosVeiculos, buscarVeiculosPorCliente } from '../services/veiculoService';
import { listarDepartamentos } from '../services/departamentoService';
import { Cliente } from '../types/cliente';
import { Veiculo } from '../types/veiculo';
import { Departamento } from '../types/departamento';

interface FormData {
  clienteId: number;
  veiculoId: number;
  departamentoId: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  dataEntrada: string;
  dataPrevisao: string;
  servicosRealizar: string;
  observacoes: string;
  consultorResponsavel: string;
  status: 'orçamento' | 'em_andamento' | 'concluido' | 'aguardando_retirada';
}

const OrdemServicoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdicao = !!id;

  const [formData, setFormData] = useState<FormData>({
    clienteId: 0,
    veiculoId: 0,
    departamentoId: 0,
    placa: '',
    modelo: '',
    marca: '',
    ano: new Date().getFullYear(),
    cor: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    dataPrevisao: '',
    servicosRealizar: '',
    observacoes: '',
    consultorResponsavel: '',
    status: 'orçamento'
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculosFiltrados, setVeiculosFiltrados] = useState<Veiculo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      const clientesResponse = await listarClientes(1, 1000);
      const veiculosResponse = await listarTodosVeiculos();
      const departamentosResponse = await listarDepartamentos();
      
      setClientes(clientesResponse.dados);
      setVeiculos(veiculosResponse);
      setVeiculosFiltrados(veiculosResponse);
      setDepartamentos(departamentosResponse);

      if (isEdicao && id) {
        const ordem = await buscarOrdemServicoPorId(parseInt(id));
        if (ordem) {
          setFormData({
            clienteId: ordem.clienteId || 0,
            veiculoId: ordem.veiculoId || 0,
            departamentoId: ordem.departamentoId || 0,
            placa: ordem.placa || '',
            modelo: ordem.modelo || '',
            marca: ordem.marca || '',
            ano: ordem.ano || new Date().getFullYear(),
            cor: ordem.cor || '',
            dataEntrada: ordem.dataEntrada || new Date().toISOString().split('T')[0],
            dataPrevisao: ordem.dataPrevisao || '',
            servicosRealizar: ordem.servicosRealizar || '',
            observacoes: ordem.observacoes || '',
            consultorResponsavel: ordem.consultorResponsavel || '',
            status: ordem.status || 'orçamento'
          });
        } else {
          alert('Ordem de serviço não encontrada');
          navigate('/ordens-servico');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleClienteChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clienteId = parseInt(e.target.value);
    setFormData({ ...formData, clienteId, veiculoId: 0 });
    
    if (clienteId > 0) {
      const veiculosDoCliente = await buscarVeiculosPorCliente(clienteId);
      setVeiculosFiltrados(veiculosDoCliente);
    } else {
      setVeiculosFiltrados([]);
    }
    
    if (erros.clienteId) {
      setErros({ ...erros, clienteId: '' });
    }
  };

  const handleVeiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const veiculoId = parseInt(e.target.value);
    const veiculo = veiculosFiltrados.find(v => v.id === veiculoId);
    
    if (veiculo) {
      setFormData({
        ...formData,
        veiculoId,
        placa: veiculo.placa || '',
        modelo: veiculo.modelo || '',
        marca: veiculo.marca || '',
        ano: veiculo.ano || new Date().getFullYear(),
        cor: veiculo.cor || ''
      });
    } else {
      setFormData({ ...formData, veiculoId });
    }
    
    if (erros.veiculoId) {
      setErros({ ...erros, veiculoId: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (erros[name]) {
      setErros({ ...erros, [name]: '' });
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

    if (!formData.departamentoId || formData.departamentoId === 0) {
      novosErros.departamentoId = 'Selecione um departamento';
    }

    if (!formData.dataPrevisao) {
      novosErros.dataPrevisao = 'Data de previsão é obrigatória';
    } else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataPrevisao = new Date(formData.dataPrevisao);
      
      if (dataPrevisao <= hoje) {
        novosErros.dataPrevisao = 'Data de previsão deve ser futura';
      }
    }

    if (!formData.servicosRealizar || !formData.servicosRealizar.trim()) {
      novosErros.servicosRealizar = 'Descreva os serviços a realizar';
    }

    if (!formData.consultorResponsavel || !formData.consultorResponsavel.trim()) {
      novosErros.consultorResponsavel = 'Consultor responsável é obrigatório';
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
      const dadosParaEnviar = { ...formData };

      if (isEdicao && id) {
        await atualizarOrdemServico(parseInt(id), dadosParaEnviar);
        alert('Ordem de serviço atualizada com sucesso!');
      } else {
        await criarOrdemServico(dadosParaEnviar);
        alert('Ordem de serviço criada com sucesso!');
      }
      
      navigate('/ordens-servico');
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error);
      alert(error.response?.data?.error || 'Erro ao salvar ordem de serviço. Tente novamente.');
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
        {isEdicao ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
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
                {cliente.nome}
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
            disabled={carregando || !formData.clienteId}
          >
            <option value={0}>Selecione um veículo</option>
            {veiculosFiltrados.map(veiculo => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.placa} - {veiculo.modelo}
              </option>
            ))}
          </select>
          {erros.veiculoId && <span style={styles.errorText}>{erros.veiculoId}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Departamento:*</label>
          <select
            name="departamentoId"
            value={formData.departamentoId}
            onChange={handleChange}
            style={{...styles.select, borderColor: erros.departamentoId ? '#dc3545' : '#ddd'}}
            disabled={carregando}
          >
            <option value={0}>Selecione um departamento</option>
            {departamentos.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.nome}
              </option>
            ))}
          </select>
          {erros.departamentoId && <span style={styles.errorText}>{erros.departamentoId}</span>}
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Data de Entrada:*</label>
            <input
              type="date"
              name="dataEntrada"
              value={formData.dataEntrada}
              onChange={handleChange}
              style={styles.input}
              disabled={carregando}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Data Prevista:*</label>
            <input
              type="date"
              name="dataPrevisao"
              value={formData.dataPrevisao}
              onChange={handleChange}
              style={{...styles.input, borderColor: erros.dataPrevisao ? '#dc3545' : '#ddd'}}
              disabled={carregando}
            />
            {erros.dataPrevisao && <span style={styles.errorText}>{erros.dataPrevisao}</span>}
          </div>
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
            <option value="orçamento">ORÇAMENTO</option>
            <option value="em_andamento">EM ANDAMENTO</option>
            <option value="concluido">CONCLUÍDO</option>
            <option value="aguardando_retirada">AGUARDANDO RETIRADA</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Serviços a Realizar:*</label>
          <textarea
            name="servicosRealizar"
            value={formData.servicosRealizar}
            onChange={handleChange}
            style={{...styles.textarea, borderColor: erros.servicosRealizar ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            rows={4}
            placeholder="Descreva os serviços que serão realizados..."
          />
          {erros.servicosRealizar && <span style={styles.errorText}>{erros.servicosRealizar}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Consultor Responsável:*</label>
          <input
            type="text"
            name="consultorResponsavel"
            value={formData.consultorResponsavel}
            onChange={handleChange}
            style={{...styles.input, borderColor: erros.consultorResponsavel ? '#dc3545' : '#ddd'}}
            disabled={carregando}
            placeholder="Nome do consultor"
          />
          {erros.consultorResponsavel && <span style={styles.errorText}>{erros.consultorResponsavel}</span>}
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate('/ordens-servico')}
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
    fontSize: '24px',
    color: '#333',
    marginBottom: '24px'
  },
  form: {
    maxWidth: '700px',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '16px'
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
    fontFamily: "Arial, Helvetica, sans-serif",
    color: '#333'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
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
    fontFamily: "Arial, Helvetica, sans-serif",
    resize: 'vertical' as const
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
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  buttonCancelar: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '12px',
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

export default OrdemServicoForm;