const express = require("express");
const {
    getRoles,
    getPermissions,
    createRole,
    assignRoleToUser,
    deleteRole,
    updateRole,
    createPermission,
    deletePermission,
    getUsersByRole,
    removeRoleFromUser
} = require("../controllers/roles.controller");

const router = express.Router();

// Rutas para roles
router.get("/", getRoles); 
router.get("/:roleId/users", getUsersByRole); 
router.post("/", createRole); 
router.put("/:id", updateRole); 
router.delete("/:id", deleteRole); 

// Rutas para asignación de roles a usuarios
router.post("/assign", assignRoleToUser); 
router.post("/remove", removeRoleFromUser); 

// Rutas para permisos
router.get("/permisos/list", getPermissions); 
router.post("/permisos/", createPermission); 
router.delete("/permisos/:id", deletePermission); 

module.exports = router;