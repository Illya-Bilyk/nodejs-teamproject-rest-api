const express = require("express");

const { validateBody, authenticate } = require("../../middlewares");
const { registerSchema, loginSchema } = require("../../validator/validate");

const ctrl = require("../../controllers/auth");
// const { schema } = require("../../models/user");

const router = express.Router();

router.post("/singup", validateBody(registerSchema), ctrl.register);

router.post("/singin", validateBody(loginSchema), ctrl.login);

router.post("/singout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.getCurrent);

router.post(
  "/subscribe",
  authenticate,
  // validateBody(schema.emailSchema),
  ctrl.sendSubscribeEmail
);
module.exports = router;
