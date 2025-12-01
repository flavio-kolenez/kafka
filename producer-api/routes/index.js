import express from "express";
import kafkaStatusRoutes from "./kafkaStatusRoutes.js";
import messagesRoutes from "./messagesRoutes.js";

const routes = express.Router();

routes.use("/status", kafkaStatusRoutes);
routes.use("/messages", messagesRoutes);

export default routes;