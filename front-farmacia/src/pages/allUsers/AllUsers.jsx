import React, { useEffect, useState } from "react";
import ItemUser from "../../components/itemUser/itemUser";
import { getUsers, getUserProfile } from "../../service/api";
import './AllUsers.css'

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsersAndProfile = async () => {
            try {
                const profileResponse = await getUserProfile();
                setCurrentUser(profileResponse.data);
    
                const usersResponse = await getUsers();
                setUsers(usersResponse.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUsersAndProfile();
    }, []);

    if (loading) return <p>Cargando usuarios...</p>;
    if (error) return <p>Error: {error}</p>;

    // Filtrar para excluir al usuario autenticado
    const filteredUsers = currentUser ? users.filter(user => user.id !== currentUser.id) : users;
    
    // Filtrar por el término de búsqueda
    const searchingUsers = filteredUsers.filter(user => 
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="allUsers-contenedor">
            <h2>Todos los usuarios</h2>
            <div className="allUsers-header">
                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            {searchingUsers.length === 0 ? (
                <p>No se encontraron usuarios.</p>
            ) : (
                searchingUsers.map((user) => (
                    <ItemUser key={user.id} theUser={user} />
                ))
            )}
        </div>
    );
};

export default AllUsers;
