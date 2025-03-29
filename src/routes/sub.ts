import { BatchGetItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Request, Response, Router } from "express";
import { Music, toMusic } from "../constants";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = Router();

router.get('/sub', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }

  const { email } = req.session.user

  const dbResponse = await dbClient.send(new QueryCommand({
    TableName: 'sub_table',
    ExpressionAttributeValues: {
      email: {
        S: email,
      },
    },
    KeyConditionExpression: "email = email",
  }));

  const subs: Music[] = [];

  if (dbResponse.Items) {
    const subKeys = [];
    for (const item of dbResponse.Items) {
      subKeys.push({
        title: item['title'],
        album: item['album'],
      });
    }

    const dbResponseBatch = await dbClient.send(new BatchGetItemCommand({
      RequestItems: {
        music_table: {
          Keys: subKeys
        }
      }
    }));

    if (dbResponseBatch.Responses) {
      for (const sub of dbResponseBatch.Responses['music_table']) {
        subs.push(toMusic(sub));
      }
    }
  }

  res.render('sub', { subs });
});

router.post('/sub', async (req, res) => {



  res.redirect('/');
});

export default router;
