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
  status: 'recepcao' | 'em_andamento' | 'concluido' | 'aguardando_retirada';
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
    status: 'recepcao'
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculosFiltrados, setVeiculosFiltrados] = useState<Veiculo[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
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
            clienteId: ordem.clienteId,
            veiculoId: ordem.veiculoId,
            departamentoId: ordem.departamentoId,
            placa: ordem.placa,
            modelo: ordem.modelo,
            marca: ordem.marca,
            ano: ordem.ano,
            cor: ordem.cor,
            dataEntrada: ordem.dataEntrada,
            dataPrevisao: ordem.dataPrevisao,
            servicosRealizar: ordem.servicosRealizar,
            observacoes: ordem.observacoes,
            consultorResponsavel: ordem.consultorResponsavel,
            status: ordem.status
          });
          
          const cliente = clientesResponse.dados.find(c => c.id === ordem.clienteId);
          if (cliente) setClienteSelecionado(cliente);
          
          const veiculo = veiculosResponse.find(v => v.id === ordem.veiculoId);
          if (veiculo) {
            setVeiculoSelecionado(veiculo);
            setFormData(prev => ({
              ...prev,
              placa: veiculo.placa,
              modelo: veiculo.modelo,
              marca: veiculo.marca,
              ano: veiculo.ano,
              cor: veiculo.cor
            }));
          }
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
    
    const cliente = clientes.find(c => c.id === clienteId);
    setClienteSelecionado(cliente || null);
    
    if (clienteId > 0) {
      const veiculosDoCliente = await buscarVeiculosPorCliente(clienteId);
      setVeiculosFiltrados(veiculosDoCliente);
    } else {
      setVeiculosFiltrados([]);
    }
    
    setVeiculoSelecionado(null);
    
    if (erros.clienteId) {
      setErros({ ...erros, clienteId: '' });
    }
  };

  const handleVeiculoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const veiculoId = parseInt(e.target.value);
    const veiculo = veiculosFiltrados.find(v => v.id === veiculoId);
    
    setVeiculoSelecionado(veiculo || null);
    
    if (veiculo) {
      setFormData({
        ...formData,
        veiculoId,
        placa: veiculo.placa,
        modelo: veiculo.modelo,
        marca: veiculo.marca,
        ano: veiculo.ano,
        cor: veiculo.cor
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

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const novasFotos = [...fotos, ...files];
    
    // Limitar a 5 fotos
    if (novasFotos.length > 5) {
      alert('Máximo de 5 fotos permitidas');
      return;
    }
    
    setFotos(novasFotos);
    
    // Criar previews
    const novasPreviews = novasFotos.map(file => URL.createObjectURL(file));
    setFotosPreview(novasPreviews);
  };

  const removerFoto = (index: number) => {
    const novasFotos = fotos.filter((_, i) => i !== index);
    const novasPreviews = fotosPreview.filter((_, i) => i !== index);
    
    setFotos(novasFotos);
    setFotosPreview(novasPreviews);
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
      
      if (dataPrevisao < hoje) {
        novosErros.dataPrevisao = 'Data de previsão deve ser futura';
      }
    }

    if (!formData.servicosRealizar.trim()) {
      novosErros.servicosRealizar = 'Descreva os serviços a realizar';
    }

    if (!formData.consultorResponsavel.trim()) {
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
      // Simular upload de fotos (depois substituir por upload real)
      const fotosUrls = fotos.map((_, index) => `foto_${Date.now()}_${index}.jpg`);
      
      const dadosParaEnviar = {
        ...formData,
        fotos: fotosUrls
      };

      if (isEdicao && id) {
        await atualizarOrdemServico(parseInt(id), dadosParaEnviar);
        alert('Ordem de serviço atualizada com sucesso!');
      } else {
        await criarOrdemServico(dadosParaEnviar);
        alert('Ordem de serviço criada com sucesso!');
      }
      
      navigate('/ordens-servico');
    } catch (error) {
      console.error('Erro ao salvar ordem:', error);
      alert('Erro ao salvar ordem de serviço. Tente novamente.');
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
      <p style={styles.subtitle}>Cadastre um novo veículo na funilaria</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Seção: Dados do Veículo */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Dados do Veículo</h3>
          
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Número da O.S.:</label>
              <input
                type="text"
                value={isEdicao ? `OS-${id}` : 'Automático'}
                style={{...styles.input, backgroundColor: '#f5f5f5'}}
                disabled
              />
              <span style={styles.helperText}>Gerado automaticamente</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Placa:*</label>
              <input
                type="text"
                value={formData.placa}
                style={{...styles.input, backgroundColor: '#f5f5f5'}}
                disabled
              />
              <span style={styles.helperText}>Preenchido automaticamente ao selecionar veículo</span>
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Marca:*</label>
              <input
                type="text"
                value={formData.marca}
                style={{...styles.input, backgroundColor: '#f5f5f5'}}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Modelo:*</label>
              <input
                type="text"
                value={formData.modelo}
                style={{...styles.input, backgroundColor: '#f5f5f5'}}
                disabled
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Ano:*</label>
              <input
                type="text"
                value={formData.ano}
                style={{...styles.input, backgroundColor: '#f5f5f5'}}
                disabled
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Cor:*</label>
              <input
                type="text"
                value={formData.cor}
                style={{...styles.input, backgroundColor: '#f5f5f5'}}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Seção: Cliente e Departamento */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Cliente e Departamento</h3>

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
              disabled={carregando || !formData.clienteId}
            >
              <option value={0}>Selecione um veículo</option>
              {veiculosFiltrados.map(veiculo => (
                <option key={veiculo.id} value={veiculo.id}>
                  {veiculo.placa} - {veiculo.modelo} ({veiculo.ano})
                </option>
              ))}
            </select>
            {erros.veiculoId && <span style={styles.errorText}>{erros.veiculoId}</span>}
            {!formData.clienteId && (
              <span style={styles.helperText}>Selecione um cliente primeiro</span>
            )}
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
                  {dept.nome} - {dept.descricao}
                </option>
              ))}
            </select>
            {erros.departamentoId && <span style={styles.errorText}>{erros.departamentoId}</span>}
          </div>
        </div>

        {/* Seção: Datas */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Datas</h3>

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
              <label style={styles.label}>Data Prevista de Conclusão:*</label>
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
              <option value="recepcao">Recepção</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="aguardando_retirada">Aguardando Retirada</option>
            </select>
          </div>
        </div>

        {/* Seção: Serviços e Observações */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Serviços e Observações</h3>

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
            <label style={styles.label}>Observações Adicionais:</label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              style={styles.textarea}
              disabled={carregando}
              rows={3}
              placeholder="Observações adicionais sobre o serviço..."
            />
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
              placeholder="Nome do consultor responsável"
            />
            {erros.consultorResponsavel && <span style={styles.errorText}>{erros.consultorResponsavel}</span>}
            <span style={styles.helperText}>Deixe vazio para usar seu nome</span>
          </div>
        </div>

        {/* Seção: Fotos */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Fotos do Veículo</h3>
          
          <div style={styles.fotoUploadArea}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFotoUpload}
              style={styles.fileInput}
              disabled={carregando}
              id="foto-upload"
            />
            <label htmlFor="foto-upload" style={styles.fotoUploadLabel}>
              📸 Clique aqui para adicionar fotos
            </label>
            <span style={styles.helperText}>Máximo 5 fotos. Formatos: JPG, PNG</span>
          </div>

          {fotosPreview.length > 0 && (
            <div style={styles.fotosPreview}>
              {fotosPreview.map((preview, index) => (
                <div key={index} style={styles.fotoPreviewItem}>
                  <img src={preview} alt={`Preview ${index + 1}`} style={styles.fotoPreviewImg} />
                  <button
                    type="button"
                    onClick={() => removerFoto(index)}
                    style={styles.removerFotoBtn}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
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
            {carregando ? 'Salvando...' : (isEdicao ? 'Atualizar Ordem' : 'Cadastrar Veículo')}
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
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px'
  },
  form: {
    maxWidth: '800px',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px'
  },
  section: {
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid #eee'
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '20px',
    paddingBottom: '8px',
    borderBottom: '2px solid #007bff',
    display: 'inline-block'
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
  fotoUploadArea: {
    border: '2px dashed #ddd',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center' as const,
    marginBottom: '16px'
  },
  fileInput: {
    display: 'none'
  },
  fotoUploadLabel: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '8px'
  },
  fotosPreview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  },
  fotoPreviewItem: {
    position: 'relative' as const,
    borderRadius: '4px',
    overflow: 'hidden'
  },
  fotoPreviewImg: {
    width: '100%',
    height: '100px',
    objectFit: 'cover' as const
  },
  removerFotoBtn: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '24px'
  },
  buttonSalvar: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    flex: 1
  },
  buttonCancelar: {
    backgroundColor: '#6c757d',
    color: 'white',
    padding: '12px 24px',
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