import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../views/Login.jsx";
import Home from "../views/Home.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
export default function AppRoutes() {
  const { logado, carregando } = useAuth();
  if (carregando) return <main className="loading-screen" role="status">Verificando sua sessão…</main>;
  return <Routes>
    <Route path="/" element={logado ? <Navigate to="/home" replace /> : <Login />} />
    <Route path="/home" element={logado ? <Home /> : <Navigate to="/" replace />} />
    <Route path="*" element={<Navigate to={logado ? "/home" : "/"} replace />} />
  </Routes>;
}
