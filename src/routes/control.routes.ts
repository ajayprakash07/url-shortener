import { Router } from "express";

const router= Router();

router.route("/convert").post();
router.route("/short/:code").get();

export default router;