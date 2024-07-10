import express from "express";
import { authenticate } from "../middlewares/auth/authenticate";

const TestRouter = express.Router();


TestRouter.post("/",authenticate, (req, res) => {
    console.log(req.user);
    
    return res.status(500).send('')
})
export { TestRouter }