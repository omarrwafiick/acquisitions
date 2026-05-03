import express from 'express';
import responseHandler from '#utils/response.js';
import { register } from '#controllers/auth.controller.js';

const router = express.Router();

router.post("/login", register);

router.post("/register", (req, res) => {
    responseHandler(req, res, { message: ""}, 200)
});

router.post("/logout", (req, res) => {
    responseHandler(req, res, { message: "" }, 200)
});

export default router;