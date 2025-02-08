import React, { useEffect, useState } from "react";
import ItemUser from "../../components/itemUser/itemUser";

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("No token found. Please log in.");
            setLoading(false);
            return;
        }

        // Obtener el usuario autenticado
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("http://localhost:5000/auth/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Error obteniendo perfil");
                const userData = await response.json();
                setCurrentUser(userData);
            } catch (err) {
                setError(err.message);
            }
        };

        // Obtener la lista de usuarios
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:5000/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) throw new Error("Error obteniendo usuarios");
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
        fetchUsers();
    }, []);

    if (loading) return <p>Cargando usuarios...</p>;
    if (error) return <p>Error: {error}</p>;

    // Filtrar para excluir al usuario autenticado
    const filteredUsers = currentUser ? users.filter(user => user.id !== currentUser.id) : users;

    return (
        <div className="allUsers-contenedor">
            <h2>Todos los usuarios</h2>
            {filteredUsers.length === 0 ? (
                <p>No hay otros usuarios disponibles.</p>
            ) : (
                filteredUsers.map((user) => (
                    <ItemUser key={user.id} theUser={user} />
                ))
            )}
        </div>
    );
};

export default AllUsers;
