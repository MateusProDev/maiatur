import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import './AdminCampaigns.css';

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'), limit(50));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCampaigns(docs);
      } catch (err) {
        console.error('Error loading campaigns', err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remover campanha?')) return;
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      window.alert('Erro ao deletar: ' + (err.message || err));
    }
  };

  return (
    <div className="admin-campaigns-page">
      <header className="campaigns-header">
        <h2>Campanhas</h2>
        <div className="campaign-actions">
          <a className="btn primary" href="/admin/campaigns/new">Nova Campanha</a>
        </div>
      </header>

      <section className="campaigns-list">
        {loading && <p>Carregando campanhas...</p>}
        {!loading && error && <p className="error">Erro: {error}</p>}
        {!loading && !campaigns.length && <div className="empty">
          <p>Nenhuma campanha encontrada.</p>
          <p>Crie a primeira campanha usando o botão <strong>Nova Campanha</strong>.</p>
        </div>}

        <div className="campaign-cards">
          {campaigns.map(c => (
            <article className="campaign-card" key={c.id}>
              <div className="card-left">
                <div className="campaign-rank">#{c.rank || ''}</div>
              </div>
              <div className="card-main">
                <h3 className="campaign-subject">{c.subject || '(sem assunto)'}</h3>
                <p className="campaign-meta">Criada: {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : c.createdAt || '—'}</p>
                <div className="campaign-body-preview">{String(c.htmlContent || c.textContent || '').slice(0, 220)}</div>
                <div className="campaign-metrics">
                  <span className="metric">Para: {(c.to || []).length || 0}</span>
                  <span className="metric">Tentativas: {c.attempts || 0}</span>
                  <span className="metric">Status: {c.status || '—'}</span>
                </div>
              </div>
              <div className="card-actions">
                <a className="btn" href={`/admin/campaigns/${c.id}`}>Editar</a>
                <button className="btn" onClick={() => handleDelete(c.id)}>Remover</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminCampaigns;
