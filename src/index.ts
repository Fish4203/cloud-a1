import * as express from "express";
import dotenv from "dotenv";
import loginRouter from "./routes/login.ts";
import queryRouter from "./routes/query.ts";
import subRouter from "./routes/sub.ts";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import session from "express-session";

dotenv.config();
const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const app: express.Express = express.default();
const port = process.env.PORT || 3000;

app.use(session({
  secret: 'cool-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));


app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Express + TypeScript Server");
});

app.use('/login', loginRouter);
app.use('/query', queryRouter);
app.use('/sub', subRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});