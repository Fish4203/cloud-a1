import * as express from "express";
import dotenv from "dotenv";
import loginRouter from "./routes/login.ts";
import queryRouter from "./routes/query.ts";
import subRouter from "./routes/sub.ts";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { jwtSecret } from "./constants.ts";

dotenv.config();

const app: express.Express = express.default();
const port = process.env.PORT || 80;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(jwtSecret))

app.use('/', loginRouter);
app.use('/', queryRouter);
app.use('/', subRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});