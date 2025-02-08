import React, { useEffect, useState } from "react";
import ItemUser from "../../components/itemUser/itemUser";
import { getUsers,getUserProfile } from "../../service/api";

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
