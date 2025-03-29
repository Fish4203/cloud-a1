import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as loginRouter from "./routes/login";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import session from "express-session";

dotenv.config();
const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(session({
  secret: 'cool-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use('/login', loginRouter.default);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});