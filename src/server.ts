import express from "express";
import { SERVER_HOST, SERVER_PORT } from "./utils/constants";
import APIRoutes from "./routes/index";

const app = express();

app.use(express.json());

app.use(APIRoutes);

app.listen(Number.parseInt(SERVER_PORT, 10), SERVER_HOST, () => {
	console.log(`server running on http://${SERVER_HOST}:${SERVER_PORT}`);
});
