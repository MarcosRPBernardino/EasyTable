const express = require("express");
const {loginManager} = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginManager);

module.exports = router;