import React from 'react';

const DashboardReservas = ({ reservas, motoristas, onDelegar }) => (
  <div className="dashboard-reservas">
    <h2>Reservas</h2>
    <ul>
      {reservas.map(r => (
        <li key={r.id}>
          {r.nomeCliente} - {r.data} {r.horario} - {r.destino} - R$ {r.valor} - Status: {r.status}
          <select onChange={e => onDelegar(r.id, e.target.value)} value={r.motoristaId || ''}>
            <option value="">Delegar para...</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  </div>
);
export default DashboardReservas;
