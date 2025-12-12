import express from "express";
import kafkaStatusRoutes from "./kafkaStatusRoutes.js";
import messagesRoutes from "./messagesRoutes.js";
import stockRoutes from "./stockRoutes.js";

const routes = express.Router();

routes.use("/status", kafkaStatusRoutes);
routes.use("/", messagesRoutes);
routes.use("/stock", stockRoutes);

export default routes;