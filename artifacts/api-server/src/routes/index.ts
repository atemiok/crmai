import { Router, type IRouter } from "express";
import healthRouter from "./health";
import signupPreflightRouter from "./signup-preflight";

const router: IRouter = Router();

router.use(healthRouter);
router.use(signupPreflightRouter);

export default router;
