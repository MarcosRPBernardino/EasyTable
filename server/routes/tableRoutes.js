const express = require("express");
const{ getTables, createTable, updateTable, deleteTable, } = require ("../controllers/tableController");
const router = express.Router();

router.get("/", getTables);
router.post("/", createTable);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

module.exports = router;