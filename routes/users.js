const express = require("express");

const { validateBody, authenticate } = require("../middlewares");
const { registerSchema, loginSchema } = require("../validator/validate");

const ctrl = require("../controllers/auth");

const router = express.Router();

router.post("/register", validateBody(registerSchema), ctrl.register);

router.post("/login", validateBody(loginSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

module.exports = router;
