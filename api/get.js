const express = require("express");
const router = express.Router();
const getController = require("../controller/getController");
const ROLES_LIST = require("../config/rolesList");
const verifyRoles = require("../middleware/verifyRoles");

router.route("/insert/:table").post(getController.insertData);
router.route("/update/:table").post(getController.updateData);
router.route("/get/:table").get(getController.getData);

module.exports = { getrouter: router, getController: getController };
