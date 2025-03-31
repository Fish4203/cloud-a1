import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = express.Router();

type User = {
  username: string;
  email: string;
};

// Augment express-session with a custom SessionData object
declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

router.get('/login', (req, res) => {
  res.render('login.ejs', { formError: undefined });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const dbResponse = await dbClient.send(new GetItemCommand({
    TableName: 'user_table',
    Key: {
      email: {
        S: email,
      },
    },
  }));

  if (!dbResponse.Item || !dbResponse.Item['user_name'].S) {
    res.render('login.ejs', { formError: 'couldn\'t find user' });
    return;
  }

  if (dbResponse.Item['password'].S !== password) {
    res.render('login.ejs', { formError: 'wrong password' });
    return;
  }

  res.cookie('token', { username: dbResponse.Item['user_name'].S, email });
  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('register.ejs');
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const dbResponse = await dbClient.send(new PutItemCommand({
    TableName: 'user_table',
    Item: {
      username: {
        S: username,
      },
      email: {
        S: email,
      },
      password: {
        S: password,
      },
    },
  }));

  if (dbResponse.$metadata.httpStatusCode !== 200) {
    res.render('register', { formError: 'couldn\'t create user' });
    return;
  }


  res.redirect('/login');
});

export default router;
