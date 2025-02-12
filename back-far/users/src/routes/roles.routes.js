const express = require("express");
const {
  getRoles,
  getPermissions,
  createRole,
  assignRoleToUser,
  deleteRole,
} = require("../controllers/roles.controller");

const router = express.Router();

router.get("/", getRoles); 
router.get("/permisos", getPermissions); 
router.post("/", createRole); 
router.post("/assign", assignRoleToUser); 
router.delete("/:id", deleteRole); 

module.exports = router;
