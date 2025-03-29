import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Request, Response, Router } from "express";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = Router();

router.get('/sub', (req, res) => {
  res.render('login');
});

router.post('/sub', async (req, res) => {
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

  if (dbResponse.Item['password'].S !== password) {
    res.render('login', { formError: 'wrong password' });
    return;
  }

  res.redirect('/');
});

export default router;
