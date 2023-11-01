const express = require("express");

const { validateBody, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/user");

const ctrl = require("../../controllers/auth");

const router = express.Router();

router.post("/signup", validateBody(schemas.registerSchema), ctrl.register);

router.post("/signin", validateBody(schemas.loginSchema), ctrl.login);

router.post("/signout", authenticate, ctrl.signout);

router.post("/refresh", ctrl.refreshTokens);

router.get("/current", authenticate, ctrl.getCurrent);

router.post(
  "/subscribe",
  authenticate,
  validateBody(schemas.emailSchema),
  ctrl.sendSubscribeEmail
);

module.exports = router;
