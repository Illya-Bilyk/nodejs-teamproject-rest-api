const express = require("express");

const { validateBody, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/user");

const ctrl = require("../../controllers/auth");

const router = express.Router();

router.post("/singup", validateBody(schemas.registerSchema), ctrl.register);

router.post("/singin", validateBody(schemas.loginSchema), ctrl.login);

router.post("/singout", authenticate, ctrl.logout);

router.post("/refresh", ctrl.refreshTokens);

router.get("/current", authenticate, ctrl.getCurrent);

router.post(
  "/subscribe",
  authenticate,
  validateBody(schemas.emailSchema),
  ctrl.sendSubscribeEmail
);

module.exports = router;
