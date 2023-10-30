const express = require("express");

const { validateBody, authenticate } = require("../../middlewares");

const { schemas } = require("../../models/user");


const ctrl = require("../../controllers/auth");
// const { schema } = require("../../models/user");

const router = express.Router();


router.post("/singup", validateBody(schemas.registerSchema), ctrl.register);

router.post("/singin", validateBody(schemas.loginSchema), ctrl.login);

// router.get("/google", ctrl.googleAuth);

// router.get("/google-redirect", ctrl.googleRedirect);

router.post("/logout", authenticate, ctrl.logout);

router.get("/current", authenticate, ctrl.getCurrent);


router.post(
  "/subscribe",
  authenticate,
  // validateBody(schema.emailSchema),
  ctrl.sendSubscribeEmail
);

module.exports = router;
