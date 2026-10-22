import { Router } from "express";

const router= Router();

router.route("/convert").post();
router.route("/short").get();

export default router;