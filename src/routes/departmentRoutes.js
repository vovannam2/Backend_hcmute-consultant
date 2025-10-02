const express = require("express");
const { 
  getAllDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} = require("../controllers/common/DepartmentController");

const { 
  getFieldsByDepartment, 
  getFieldById 
} = require("../controllers/common/FieldController");

const { getRoleAskList } = require("../controllers/common/RoleAskController");

const router = express.Router();

// =======================
// 🔹 Department APIs
// =======================

// Public APIs
router.get("/list-department", getAllDepartments);
router.get("/department/:id", getDepartmentById);

// Admin APIs (có thể thêm auth middleware sau)
router.post("/department", createDepartment);
router.put("/department/:id", updateDepartment);
router.delete("/department/:id", deleteDepartment);

// =======================
// 🔹 Field APIs
// =======================

// Public APIs
router.get("/list-field-by-department", getFieldsByDepartment);
router.get("/field/:id", getFieldById);

// =======================
// 🔹 RoleAsk APIs
// =======================

// Public APIs
router.get("/user/question/role-ask", getRoleAskList);

module.exports = router;
