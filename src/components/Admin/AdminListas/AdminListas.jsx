import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { 
  FiSettings, FiPlus, FiTrash, FiSave, FiList, 
  FiTruck, FiMapPin, FiMap, FiHome, FiNavigation,
  FiChevronDown, FiChevronUp, FiAlertCircle
} from 'react-icons/fi';
import './AdminListas.css';

const AdminListas = () => {
  const [listas, setListas] = useState({
    veiculos: {
      items: [],
      atualizadoEm: null
    },
    destinos: {
      tipo: 'destinos',
      ativo: true,
      ordem: 3,
      items: [],
      atualizadoEm: null
    },
    passeios: {
      items: [],
      atualizadoEm: null
    },
    hoteis: {
      tipo: 'hoteis',
      ativo: true,
      ordem: 1,
      items: [],
      atualizadoEm: null
    },
    aeroportos: {
      tipo: 'aeroportos',
      ativo: true,
      ordem: 2,
      items: [],
      atualizadoEm: null
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    veiculos: true,
    destinos: true,
    passeios: false,
    hoteis: false,
    aeroportos: false
  });

  useEffect(() => {
    loadListas();
  }, []);

  const loadListas = async () => {
    try {
      setLoading(true);
      
      const listasNames = ['veiculos', 'destinos', 'passeios', 'hoteis', 'aeroportos'];
      const loadedListas = {};

      for (const name of listasNames) {
        const docRef = doc(db, 'listas', name);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          loadedListas[name] = docSnap.data();
        } else {
          loadedListas[name] = listas[name]; // Usar dados padrão
        }
      }

      setListas(loadedListas);
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      setMessage('❌ Erro ao carregar listas');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (listaName) => {
    try {
      setSaving(prev => ({ ...prev, [listaName]: true }));
      
      const dataToSave = {
        ...listas[listaName],
        atualizadoEm: new Date().toISOString()
      };

      const docRef = doc(db, 'listas', listaName);
      await setDoc(docRef, dataToSave);
      
      setMessage(`✅ Lista "${listaName}" salva com sucesso!`);
      setTimeout(() => setMessage(''), 3000);
      
      // Atualizar estado local com nova data
      setListas(prev => ({
        ...prev,
        [listaName]: dataToSave
      }));
    } catch (error) {
      console.error(`Erro ao salvar lista ${listaName}:`, error);
      setMessage(`❌ Erro ao salvar lista "${listaName}"`);
    } finally {
      setSaving(prev => ({ ...prev, [listaName]: false }));
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addItem = (listaName) => {
    setListas(prev => ({
      ...prev,
      [listaName]: {
        ...prev[listaName],
        items: [...prev[listaName].items, '']
      }
    }));
  };

  const removeItem = (listaName, index) => {
    if (window.confirm('Deseja remover este item?')) {
      setListas(prev => ({
        ...prev,
        [listaName]: {
          ...prev[listaName],
          items: prev[listaName].items.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updateItem = (listaName, index, value) => {
    setListas(prev => ({
      ...prev,
      [listaName]: {
        ...prev[listaName],
        items: prev[listaName].items.map((item, i) => 
          i === index ? value : item
        )
      }
    }));
  };

  const moveItem = (listaName, index, direction) => {
    const newItems = [...listas[listaName].items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    setListas(prev => ({
      ...prev,
      [listaName]: {
        ...prev[listaName],
        items: newItems
      }
    }));
  };

  const listasConfig = [
    {
      name: 'veiculos',
      title: '🚗 Veículos',
      icon: FiTruck,
      description: 'Tipos de veículos disponíveis para transfers e passeios',
      placeholder: 'Ex: Carro até 6 pessoas'
    },
    {
      name: 'destinos',
      title: '📍 Destinos',
      icon: FiMapPin,
      description: 'Destinos disponíveis para transfers',
      placeholder: 'Ex: Jericoacoara'
    },
    {
      name: 'passeios',
      title: '🗺️ Passeios',
      icon: FiMap,
      description: 'Passeios turísticos disponíveis',
      placeholder: 'Ex: Beach Park'
    },
    {
      name: 'hoteis',
      title: '🏨 Hotéis',
      icon: FiHome,
      description: 'Hotéis e pousadas cadastrados',
      placeholder: 'Ex: Hotel Praia Centro'
    },
    {
      name: 'aeroportos',
      title: '✈️ Aeroportos',
      icon: FiNavigation,
      description: 'Aeroportos cadastrados',
      placeholder: 'Ex: Aeroporto Internacional de Fortaleza (FOR)'
    }
  ];

  if (loading) {
    return (
      <div className="admin-listas-loading">
        <div className="spinner"></div>
        <p>Carregando listas...</p>
      </div>
    );
  }

  return (
    <div className="admin-listas">
      <div className="admin-listas-header">
        <div className="header-content">
          <FiList className="header-icon" />
          <div>
            <h1>Gerenciar Listas</h1>
            <p>Configure veículos, destinos, passeios, hotéis e aeroportos</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="admin-listas-container">
        {listasConfig.map(({ name, title, icon: Icon, description, placeholder }) => (
          <div key={name} className="lista-section">
            <div 
              className="lista-header"
              onClick={() => toggleSection(name)}
            >
              <div className="lista-header-left">
                <Icon className="lista-icon" />
                <div>
                  <h2>{title}</h2>
                  <p className="lista-description">{description}</p>
                </div>
              </div>
              <div className="lista-header-right">
                <span className="item-count">
                  {listas[name]?.items?.length || 0} {listas[name]?.items?.length === 1 ? 'item' : 'itens'}
                </span>
                {expandedSections[name] ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </div>

            {expandedSections[name] && (
              <div className="lista-content">
                <div className="lista-items">
                  {listas[name]?.items?.map((item, index) => (
                    <div key={index} className="lista-item">
                      <span className="item-number">{index + 1}</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateItem(name, index, e.target.value)}
                        placeholder={placeholder}
                        className="item-input"
                      />
                      <div className="item-actions">
                        <button
                          onClick={() => moveItem(name, index, 'up')}
                          disabled={index === 0}
                          className="btn-move"
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(name, index, 'down')}
                          disabled={index === listas[name].items.length - 1}
                          className="btn-move"
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeItem(name, index)}
                          className="btn-remove"
                          title="Remover item"
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lista-actions">
                  <button
                    onClick={() => addItem(name)}
                    className="btn-add"
                  >
                    <FiPlus /> Adicionar {title.split(' ')[1]}
                  </button>
                  
                  <button
                    onClick={() => handleSave(name)}
                    disabled={saving[name]}
                    className="btn-save"
                  >
                    {saving[name] ? (
                      <>
                        <div className="btn-spinner"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FiSave /> Salvar {title.split(' ')[1]}
                      </>
                    )}
                  </button>
                </div>

                {listas[name]?.atualizadoEm && (
                  <div className="lista-info">
                    <FiAlertCircle />
                    Última atualização: {new Date(listas[name].atualizadoEm).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="admin-listas-help">
        <FiAlertCircle />
        <div>
          <strong>Dica:</strong> As alterações feitas aqui serão refletidas automaticamente nos 
          formulários de reservas (Passeios, Transfers de Chegada, Saída, etc).
        </div>
      </div>
    </div>
  );
};

export default AdminListas;
