import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AdminDashboard from "../../components/Admin/AdminDashboard/AdminDashboard";

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Carregando...</p>;
  return user ? <AdminDashboard /> : <Navigate to="/admin/login" />;
};

export default Admin;
