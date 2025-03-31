import * as express from "express";
import dotenv from "dotenv";
import loginRouter from "./routes/login.ts";
import queryRouter from "./routes/query.ts";
import subRouter from "./routes/sub.ts";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import session from "express-session";
import bodyParser from "body-parser";

dotenv.config();
const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const app: express.Express = express.default();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'cool-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));


app.use('/', loginRouter);
app.use('/', queryRouter);
app.use('/', subRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});