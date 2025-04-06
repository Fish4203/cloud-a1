import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../constants.ts";

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


  const loginRes = await login(email, password);
  if (loginRes) {
    const token = jwt.sign({ username: loginRes, email }, jwtSecret);
    res.cookie('token', token);
    res.redirect('/');
  } else {
    res.render('login.ejs', { formError: 'could not find user' });
  }
});

router.get('/register', (req, res) => {
  res.render('register.ejs', { formError: undefined });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const registerRes = await register(username, email, password);
  if (registerRes === null) {
    res.redirect('/login');
  } else {
    res.render('register.ejs', { formError: registerRes });
  }
});

const register = async (username: string, email: string, password: string) => {
  try {
    const dbResponse = await dbClient.send(new PutItemCommand({
      TableName: 'user_table',
      Item: {
        user_name: {
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
      return 'couldn\'t create user';
    }
  } catch (error) {
    return error;
  }

  return null;
};

const login = async (email: string, password: string) => {
  try {
    const dbResponse = await dbClient.send(new GetItemCommand({
      TableName: 'user_table',
      Key: {
        email: {
          S: email,
        },
      },
    }));

    if (!dbResponse.Item || !dbResponse.Item['user_name'] || !dbResponse.Item['user_name'].S) {
      return false;
    }

    if (dbResponse.Item['password'].S !== password) {
      return false;
    }

    return dbResponse.Item['user_name'].S;
  } catch (error) {
    return false;
  }
};

router.get('/logout', (req, res) => {
  res.cookie('token', undefined);
  res.redirect('/login');
});

export default router;
