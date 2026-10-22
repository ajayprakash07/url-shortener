import { Router } from "express";
import { createLink , directURL } from "../controllers/url.controllers.js";
const router= Router();

router.route("/convert").post(createLink);
router.route("/srt/:code").get(directURL);

export default router;