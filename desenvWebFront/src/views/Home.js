import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
export default function Home() {
const { logout } = useAuth();
const navigate = useNavigate();
function handleLogout() {
logout();
navigate("/");
}
return (
<div>
<h1>Bem-vindo!</h1>
<button onClick={handleLogout}>Sair</button>
</div>
);
}

import { useEffect, useState } from "react";
import { api } from "../services/api";
export default function Home() {
const [usuarios, setUsuarios] = useState([]);
useEffect(() => {
api.get("/usuarios").then((res) => {
setUsuarios(res.data);
});
}, []);
return (
<ul>
{usuarios.map((u) => (
<li key={u.id}>{u.nome}</li>
))}
</ul>
);
}
