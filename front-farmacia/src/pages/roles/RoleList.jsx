import './RoleList.css';

const RoleList = ({ roles, onEdit, onDelete }) => {
  return (
    <div className="role-list">
      <h2>Lista de Rossles</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Permisos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id}>
              <td>{role.nombre}</td>
              <td>
                {role.permisos?.map(p => p.permission?.nombre).join(", ") || "Ninguno"}
              </td>
              <td className="actions">
                <button onClick={() => onEdit(role)}>Editar</button>
                <button className="delete" onClick={() => onDelete(role.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleList;