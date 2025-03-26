import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Request, Response, Router } from "express";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = Router();

router.get('/login', (req, res) => {
  res.render('login');
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

  if (!dbResponse.Item) {
    res.render('login', { formError: 'couldn\'t find user' });
    return;
  }

  if (dbResponse.Item['password'] !== password) {
    res.render('login', { formError: 'wrong password' });
    return;
  }

  res.redirect('/');
});

router.get('/register', (req, res) => {
  res.render('register');
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
