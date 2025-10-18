// src/components/Admin/AdminEditPacote/AdminEditPacote.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  collection 
} from 'firebase/firestore';
import { db, storage } from '../../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import RichTextEditorV2 from '../../RichTextEditorV2/RichTextEditorV2';
import './AdminEditPacote.css';

const AdminEditPacote = () => {
  const { pacoteId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pacote, setPacote] = useState({
    titulo: '',
    descricao: '',
    descricaoCurta: '',
    preco: 0,
    precoOriginal: 0,
    imagens: [],
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
            setPacote(docSnap.data());
          }
        } catch (error) {
          console.error("Erro ao buscar pacote:", error);
        }
      };
      fetchPacote();
    }
  }, [pacoteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPacote(prev => ({ 
      ...prev, 
      [name]: name === 'preco' || name === 'precoOriginal' ? 
        parseFloat(value) || 0 : 
        value 
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