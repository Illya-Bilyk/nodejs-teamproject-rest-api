const express = require("express");
const {
  validateBody,
  authenticate,
  isValidId,
  upload,
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
  isValidId,
  upload.single("avatar"),
  ctrl.updateUser
);

module.exports = router;
