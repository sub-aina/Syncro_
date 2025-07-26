import express from "express";
import { verifyToken } from "../middleware/authmiddleware.js";
import { submitCheckIn, getCheckIns } from "../controller/checkIn.js";

const checkInRoutes = (io) => {

    const router = express.Router();
    router.post("/", verifyToken, (req, res) => submitCheckIn(req, res, io));
    router.get("/getCheckins", verifyToken, getCheckIns);

    return router;
}
export default checkInRoutes;
