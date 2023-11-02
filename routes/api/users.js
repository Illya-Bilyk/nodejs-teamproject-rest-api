const express = require("express");

const {
  validateBody,
  authenticate,
  isValidUserId,
} = require("../../middlewares");

const { schemas } = require("../../models/user");

const ctrl = require("../../controllers/users");

const router = express.Router();

router.get("/current", authenticate, ctrl.getCurrent);

router.post(
  "/subscribe",
  authenticate,
  validateBody(schemas.emailSchema),
  ctrl.sendSubscribeEmail
);

router.patch(
  "/update",
  authenticate,
  isValidUserId,
  validateBody(schemas.updatUserSchema),
  ctrl.updatUser
);

module.exports = router;
