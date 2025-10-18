import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import "./ViewUsers.css";

const ViewUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="view-users__loading">Carregando usuários...</div>;

  return (
    <div className="view-users">
      <h2 className="view-users__title">Usuários Cadastrados</h2>
      {users.length === 0 ? (
        <p className="view-users__empty">Nenhum usuário cadastrado ainda.</p>
      ) : (
        <div className="view-users__table-wrapper">
          <table className="view-users__table">
            <thead className="view-users__table-head">
              <tr className="view-users__table-row">
                <th className="view-users__table-header">Nome</th>
                <th className="view-users__table-header">WhatsApp</th>
                <th className="view-users__table-header">Data de Cadastro</th>
              </tr>
            </thead>
            <tbody className="view-users__table-body">
              {users.map((user) => (
                <tr key={user.id} className="view-users__table-row">
                  <td className="view-users__table-cell" data-label="Nome">{user.name}</td>
                  <td className="view-users__table-cell" data-label="WhatsApp">{user.whatsapp}</td>
                  <td className="view-users__table-cell" data-label="Data de Cadastro">
                    {new Date(user.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewUsers;