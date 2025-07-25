import express from "express";
import upload from "../middleware/upload.js";
import { verifyToken } from "../middleware/authmiddleware.js";
import { createResource, fetchResources, deleteResource } from "../controller/resouceController.js";

const router = express.Router();

router.get("/:teamId", verifyToken, fetchResources);
router.post("/:teamId", (req, res, next) => {
    // console.log(" POST /api/resources/:teamId hit");
    next(); // continue to middleware chain
}, verifyToken, upload.single("file"), createResource);

// router.post("/:teamId", verifyToken, upload.single("file"), createResource);
router.delete("/:resourceId", verifyToken, deleteResource);

export default router;
