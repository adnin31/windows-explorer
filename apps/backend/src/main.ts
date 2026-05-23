import { Elysia } from "elysia";
import { folderRoutes } from "./interfaces/http/routes/folder-routes";

const port = Number(process.env.PORT ?? 3000);

const app = new Elysia()
	.use(folderRoutes)
	.get("/health", () => ({ status: "ok" }));

app.listen(port);

console.log(`Backend listening on http://localhost:${port}`);
