// src/components/Admin/AdminEditPacote/AdminEditPacote.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  collection,
  getDocs
} from 'firebase/firestore';
import { db, storage } from '../../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import RichTextEditorV2 from '../../RichTextEditorV2/RichTextEditorV2';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './AdminEditPacote.css';

const AdminEditPacote = () => {
  const { pacoteId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [allPackages, setAllPackages] = useState([]);
  const [pacote, setPacote] = useState({
    titulo: '',
    descricao: '',
    descricaoCurta: '',
    preco: 0,
    precoOriginal: 0,
    imagens: [],
    tipo: 'passeio', // Default to passeio
    destino: '',
    tempoPercurso: '',
    distancia: '',
    precoPorVeiculo: false,
    veiculos: [],
    locaisAtendidos: [],
    comodidades: [],
    vantagens: [],
    passosReserva: [],
    faq: [],
    localizacao: {
      descricao: '',
      imagemMapa: '',
      coordenadas: ''
    },
    pacotesRecomendados: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  useEffect(() => {
    if (pacoteId) {
      const fetchPacote = async () => {
        try {
          const docRef = doc(db, 'pacotes', pacoteId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('📦 Pacote carregado no admin:', data);
            console.log('📦 Tipo do pacote:', data.tipo);
            console.log('📦 Tem campos de transfer:', {
              destino: data.destino,
              veiculos: data.veiculos?.length,
              vantagens: data.vantagens?.length
            });
            setPacote(data);
          }
        } catch (error) {
          console.error("Erro ao buscar pacote:", error);
        }
      };
      fetchPacote();
    }
  }, [pacoteId]);

  useEffect(() => {
    const fetchAllPackages = async () => {
      try {
        console.log('🔍 Buscando todos os pacotes para seleção de recomendados...');
        const pacotesRef = collection(db, 'pacotes');
        const querySnapshot = await getDocs(pacotesRef);
        const packages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          titulo: doc.data().titulo,
          slug: doc.data().slug
        }));
        console.log('📦 Pacotes carregados:', packages.length, 'pacotes');
        setAllPackages(packages);
      } catch (error) {
        console.error("Erro ao buscar pacotes:", error);
      }
    };
    fetchAllPackages();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPacote(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : 
              name === 'preco' || name === 'precoOriginal' ? 
                parseFloat(value) || 0 : 
                value 
    }));
  };

  const handleNestedChange = (field, subField, value) => {
    setPacote(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value
      }
    }));
  };

  // Funções para gerenciar arrays
  const addArrayItem = (field, defaultItem = '') => {
    setPacote(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultItem]
    }));
  };

  const removeArrayItem = (field, index) => {
    setPacote(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field, index, value) => {
    setPacote(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const moveArrayItem = (field, fromIndex, toIndex) => {
    setPacote(prev => {
      const newArray = [...prev[field]];
      const [movedItem] = newArray.splice(fromIndex, 1);
      newArray.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Funções específicas para veículos
  const addVeiculo = () => {
    addArrayItem('veiculos', {
      tipo: '',
      capacidade: '',
      bagagem: '',
      imagem: '',
      legenda: ''
    });
  };

  const updateVeiculo = (index, field, value) => {
    setPacote(prev => ({
      ...prev,
      veiculos: prev.veiculos.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  // Funções específicas para FAQ
  const addFAQ = () => {
    addArrayItem('faq', { pergunta: '', resposta: '' });
  };

  const updateFAQ = (index, field, value) => {
    setPacote(prev => ({
      ...prev,
      faq: prev.faq.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleDescriptionChange = (content) => {
    setPacote(prev => ({ 
      ...prev, 
      descricao: content 
    }));
  };

  const insertTemplate = () => {
    const template = `## 🌟 Sobre este Pacote

Descreva aqui as principais características do pacote turístico.

### 📍 O que está incluído:

- **Transporte:** Descrição do transporte
- **Hospedagem:** Informações sobre acomodação  
- **Alimentação:** Detalhes das refeições
- **Passeios:** Lista dos passeios inclusos

### ⏰ Itinerário:

**Dia 1:** Chegada e acomodação  
**Dia 2:** Principais atividades  
**Dia 3:** Retorno

> 💡 **Dica especial:** Adicione informações importantes ou dicas extras aqui.

### 📋 Observações importantes:

Liste aqui informações importantes sobre documentos, vacinas, clima, etc.`;
    
    setPacote(prev => ({ 
      ...prev, 
      descricao: template 
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newImages = [...pacote.imagens];
    
    try {
      for (const file of files) {
        const storageRef = ref(storage, `pacotes/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        newImages.push(downloadURL);
      }
      setPacote(prev => ({ ...prev, imagens: newImages }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload das imagens");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...pacote.imagens];
    newImages.splice(index, 1);
    setPacote(prev => ({ ...prev, imagens: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!pacote.titulo || !pacote.descricaoCurta) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    // Validação da descrição HTML
    const descricaoText = pacote.descricao.replace(/<[^>]*>/g, '').trim();
    if (!descricaoText) {
      alert("A descrição completa não pode estar vazia");
      return;
    }

    setLoading(true);
    
    try {
      const pacoteData = {
        ...pacote,
        updatedAt: serverTimestamp()
      };

      if (pacoteId) {
        // Atualizar pacote existente
        await setDoc(doc(db, 'pacotes', pacoteId), pacoteData);
      } else {
        // Criar novo pacote
        const newDocRef = doc(collection(db, 'pacotes'));
        await setDoc(newDocRef, {
          ...pacoteData,
          id: newDocRef.id
        });
      }
      navigate('/admin/pacotes');
    } catch (error) {
      console.error("Erro ao salvar pacote:", error);
      alert("Erro ao salvar pacote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-edit-pacote">
      <h1>{pacoteId ? 'Editar Pacote' : 'Criar Novo Pacote'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Pacote *</label>
          <select
            name="tipo"
            value={pacote.tipo}
            onChange={handleChange}
            required
          >
            <option value="passeio">Passeio</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            name="titulo"
            value={pacote.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição Curta *</label>
          <input
            type="text"
            name="descricaoCurta"
            value={pacote.descricaoCurta}
            onChange={handleChange}
            required
          />
        </div>

        {/* Pacotes Recomendados */}
        <div className="form-section" style={{display: 'block'}}>
          <h3>⭐ Pacotes Recomendados (até 3)</h3>
          <p className="form-help">Selecione até 3 pacotes para mostrar como recomendação na página de detalhes deste pacote.</p>
          
          {console.log('🔍 Renderizando seção de pacotes recomendados:', {
            pacotesRecomendados: pacote.pacotesRecomendados,
            allPackagesCount: allPackages.length,
            pacoteId,
            allPackages: allPackages.slice(0, 3)
          })}
          
          {(pacote.pacotesRecomendados || []).length === 0 && (
            <p style={{color: '#666', fontStyle: 'italic', marginBottom: '1rem'}}>
              Nenhum pacote recomendado selecionado. Clique no botão abaixo para adicionar.
            </p>
          )}
          
          {(pacote.pacotesRecomendados || []).map((recomendadoId, index) => (
            <div key={index} className="array-item">
              <div className="array-item-header">
                <span>Pacote Recomendado {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeArrayItem('pacotesRecomendados', index)}
                  title="Remover"
                >
                  <FaTrash />
                </button>
              </div>
              <select
                value={recomendadoId}
                onChange={(e) => updateArrayItem('pacotesRecomendados', index, e.target.value)}
                className="form-select"
                style={{width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px'}}
              >
                <option value="">Selecione um pacote</option>
                {allPackages
                  .filter(pkg => pkg.id !== pacoteId)
                  .map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.titulo}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          
          {(!pacote.pacotesRecomendados || pacote.pacotesRecomendados.length < 3) && (
            <button
              type="button"
              onClick={() => addArrayItem('pacotesRecomendados', '')}
              className="btn-add-array"
            >
              <FaPlus /> Adicionar Pacote Recomendado
            </button>
          )}
        </div>

        {/* Campos específicos para Transfer */}
        {pacote.tipo === 'transfer' && (
          <>
            <div className="form-section">
              <h3>🚗 Informações do Transfer</h3>
              
              <div className="form-group">
                <label>Destino *</label>
                <input
                  type="text"
                  name="destino"
                  value={pacote.destino}
                  onChange={handleChange}
                  placeholder="Ex: Canoa Quebrada, Jericoacoara"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tempo de Percurso</label>
                  <input
                    type="text"
                    name="tempoPercurso"
                    value={pacote.tempoPercurso}
                    onChange={handleChange}
                    placeholder="Ex: 1h30, 3h"
                  />
                </div>

                <div className="form-group">
                  <label>Distância</label>
                  <input
                    type="text"
                    name="distancia"
                    value={pacote.distancia}
                    onChange={handleChange}
                    placeholder="Ex: 75 km, 300 km"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="precoPorVeiculo"
                    checked={pacote.precoPorVeiculo}
                    onChange={handleChange}
                  />
                  {' '}Preço por veículo (não por pessoa)
                </label>
              </div>
            </div>

            {/* Veículos */}
            <div className="form-section">
              <h3>🚐 Veículos Disponíveis</h3>
              {pacote.veiculos.map((veiculo, index) => (
                <div key={index} className="array-item vehicle-item">
                  <div className="array-item-header">
                    <span>Veículo {index + 1}</span>
                    <div className="array-item-actions">
                      <button
                        type="button"
                        onClick={() => moveArrayItem('veiculos', index, index - 1)}
                        disabled={index === 0}
                        title="Mover para cima"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveArrayItem('veiculos', index, index + 1)}
                        disabled={index === pacote.veiculos.length - 1}
                        title="Mover para baixo"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('veiculos', index)}
                        title="Remover"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de Veículo</label>
                      <input
                        type="text"
                        value={veiculo.tipo}
                        onChange={(e) => updateVeiculo(index, 'tipo', e.target.value)}
                        placeholder="Ex: Van Privativa, Carro Sedan"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Capacidade</label>
                      <input
                        type="text"
                        value={veiculo.capacidade}
                        onChange={(e) => updateVeiculo(index, 'capacidade', e.target.value)}
                        placeholder="Ex: até 16 passageiros"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Bagagem</label>
                      <input
                        type="text"
                        value={veiculo.bagagem}
                        onChange={(e) => updateVeiculo(index, 'bagagem', e.target.value)}
                        placeholder="Ex: 16 malas"
                      />
                    </div>

                    <div className="form-group">
                      <label>URL da Imagem</label>
                      <input
                        type="text"
                        value={veiculo.imagem}
                        onChange={(e) => updateVeiculo(index, 'imagem', e.target.value)}
                        placeholder="URL da imagem do veículo"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Legenda/Descrição</label>
                    <input
                      type="text"
                      value={veiculo.legenda}
                      onChange={(e) => updateVeiculo(index, 'legenda', e.target.value)}
                      placeholder="Descrição do veículo"
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addVeiculo}
                className="btn-add-array"
              >
                <FaPlus /> Adicionar Veículo
              </button>
            </div>

            {/* Locais Atendidos */}
            <div className="form-section">
              <h3>📍 Locais Atendidos</h3>
              {pacote.locaisAtendidos.map((local, index) => (
                <div key={index} className="array-item">
                  <div className="array-item-header">
                    <input
                      type="text"
                      value={local}
                      onChange={(e) => updateArrayItem('locaisAtendidos', index, e.target.value)}
                      placeholder="Ex: Aeroporto, Hotéis, Pousadas"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('locaisAtendidos', index)}
                      title="Remover"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('locaisAtendidos')}
                className="btn-add-array"
              >
                <FaPlus /> Adicionar Local
              </button>
            </div>

            {/* Comodidades */}
            <div className="form-section">
              <h3>✨ Comodidades</h3>
              {pacote.comodidades.map((comodidade, index) => (
                <div key={index} className="array-item">
                  <div className="array-item-header">
                    <input
                      type="text"
                      value={comodidade}
                      onChange={(e) => updateArrayItem('comodidades', index, e.target.value)}
                      placeholder="Ex: Ar-condicionado, Água, Wi-Fi"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('comodidades', index)}
                      title="Remover"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('comodidades')}
                className="btn-add-array"
              >
                <FaPlus /> Adicionar Comodidade
              </button>
            </div>

            {/* Vantagens */}
            <div className="form-section">
              <h3>🌟 Vantagens</h3>
              {pacote.vantagens.map((vantagem, index) => (
                <div key={index} className="array-item">
                  <div className="array-item-header">
                    <input
                      type="text"
                      value={vantagem}
                      onChange={(e) => updateArrayItem('vantagens', index, e.target.value)}
                      placeholder="Ex: EXCLUSIVIDADE, FLEXIBILIDADE"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('vantagens', index)}
                      title="Remover"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('vantagens')}
                className="btn-add-array"
              >
                <FaPlus /> Adicionar Vantagem
              </button>
            </div>

            {/* Passos de Reserva */}
            <div className="form-section">
              <h3>📋 Passos para Reserva</h3>
              {pacote.passosReserva.map((passo, index) => (
                <div key={index} className="array-item">
                  <div className="array-item-header">
                    <input
                      type="text"
                      value={passo}
                      onChange={(e) => updateArrayItem('passosReserva', index, e.target.value)}
                      placeholder="Ex: Entre em contato pelo WhatsApp"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('passosReserva', index)}
                      title="Remover"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('passosReserva')}
                className="btn-add-array"
              >
                <FaPlus /> Adicionar Passo
              </button>
            </div>

            {/* FAQ */}
            <div className="form-section">
              <h3>❓ Perguntas Frequentes (FAQ)</h3>
              {pacote.faq.map((item, index) => (
                <div key={index} className="array-item faq-item">
                  <div className="array-item-header">
                    <span>FAQ {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('faq', index)}
                      title="Remover"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="form-group">
                    <label>Pergunta</label>
                    <input
                      type="text"
                      value={item.pergunta}
                      onChange={(e) => updateFAQ(index, 'pergunta', e.target.value)}
                      placeholder="Digite a pergunta"
                    />
                  </div>

                  <div className="form-group">
                    <label>Resposta</label>
                    <textarea
                      value={item.resposta}
                      onChange={(e) => updateFAQ(index, 'resposta', e.target.value)}
                      placeholder="Digite a resposta"
                      rows="3"
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addFAQ}
                className="btn-add-array"
              >
                <FaPlus /> Adicionar Pergunta
              </button>
            </div>

            {/* Localização */}
            <div className="form-section">
              <h3>🗺️ Localização do Destino</h3>
              
              <div className="form-group">
                <label>Descrição do Destino</label>
                <textarea
                  value={pacote.localizacao?.descricao || ''}
                  onChange={(e) => handleNestedChange('localizacao', 'descricao', e.target.value)}
                  placeholder="Descreva o destino e suas características"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>URL da Imagem do Mapa</label>
                <input
                  type="text"
                  value={pacote.localizacao?.imagemMapa || ''}
                  onChange={(e) => handleNestedChange('localizacao', 'imagemMapa', e.target.value)}
                  placeholder="URL da imagem do mapa"
                />
              </div>

              <div className="form-group">
                <label>Coordenadas (Google Maps)</label>
                <input
                  type="text"
                  value={pacote.localizacao?.coordenadas || ''}
                  onChange={(e) => handleNestedChange('localizacao', 'coordenadas', e.target.value)}
                  placeholder="Ex: -4.1778, -38.1312"
                />
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <div className="description-header">
            <label>Descrição Completa *</label>
            <button 
              type="button" 
              className="template-button"
              onClick={insertTemplate}
              title="Inserir template de exemplo"
            >
              📝 Inserir Template
            </button>
          </div>
          <RichTextEditorV2
            key={`editor-${pacoteId}`}
            value={pacote.descricao}
            onChange={handleDescriptionChange}
            placeholder="Digite a descrição completa do pacote. Use as ferramentas de formatação para criar parágrafos, negrito, listas, etc."
          />
          <small className="form-help">
            Use as ferramentas de formatação acima para criar uma descrição rica com títulos, listas, negrito, etc.
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Preço Atual *</label>
            <input
              type="number"
              name="preco"
              value={pacote.preco}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Preço Original (para desconto)</label>
            <input
              type="number"
              name="precoOriginal"
              value={pacote.precoOriginal || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Imagens {uploading && "(Enviando...)"}</label>
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            accept="image/*"
            disabled={uploading}
          />
          
          {pacote.imagens.length > 0 && (
            <div className="images-preview">
              {pacote.imagens.map((img, index) => (
                <div key={index} className="image-item">
                  <img src={img} alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(index)}
                    disabled={uploading}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/pacotes')}
            className="btn-cancel"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || uploading}
            className="btn-save"
          >
            {loading ? 'Salvando...' : 'Salvar Pacote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditPacote;