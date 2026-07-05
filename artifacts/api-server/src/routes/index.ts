import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import criesRouter from "./cries";
import statsRouter from "./stats";
import calmRouter from "./calm";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users", usersRouter);
router.use("/cries", criesRouter);
router.use("/stats", statsRouter);
router.use("/calm", calmRouter);

export default router;
