import { DynamoDBClient, GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";
import jwt from "jsonwebtoken";
import { apiIp, jwtSecret } from "../constants.ts";
import axios from "axios";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = express.Router();

if (apiIp) {
  router.get('/login', (req, res) => {
    res.render('login.ejs', { formError: undefined });
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;


    const response = await axios.post(`${apiIp}/api/login`, { email, password });
    const loginRes = response.data['loginRes'];

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

    const response = await axios.post(`${apiIp}/api/register`, { username, email, password });
    const registerRes = response.data['registerRes'];
    if (registerRes) {
      res.redirect('/login');
    } else {
      res.render('register.ejs', { formError: 'couldn\'t create user' });
    }
  });
} else {
  router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const loginRes = await login(email, password);

    res.json({ loginRes });
  });

  router.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    const registerRes = await register(username, email, password);

    res.json({ registerRes });
  });
}

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
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
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
