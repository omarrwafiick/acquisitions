import express from 'express';
import responseHandler from '#utils/response.js';

const router = express.Router();

router.post("/login", (req, res) => {
    responseHandler(req, res, 200, { message: ""})
});

router.post("/register", (req, res) => {
    responseHandler(req, res, 200, { message: ""})
});

router.post("/logout", (req, res) => {
    responseHandler(req, res, 200, { message: "" })
});

export default router;