import { Router } from "express";
import { createLink , directURL , deleteURL} from "../controllers/url.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router= Router();

router.route("/convert").post(verifyJWT,createLink);
router.route("/srt/:code").get(directURL);
router.route("/delete/:id").post(deleteURL);

export default router;