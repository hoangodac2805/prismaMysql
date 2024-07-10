import express from "express";
import { authenticate } from "../middlewares/auth/authenticate";
import { authorize } from "../middlewares/auth/authorize";

const TestRouter = express.Router();


TestRouter.post("/", authenticate, authorize(["ADMIN"]), (req, res) => {
    return res.status(500).send('')
})
export { TestRouter }