import { BatchGetItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";
import { decodeToken, toMusic } from "../constants.ts";
import type { Music } from "../constants.ts";


const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = express.Router();

router.get('/', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const { email } = decodedToken;
  const subs: Music[] = [];

  try {
    const dbResponse = await dbClient.send(new QueryCommand({
      TableName: 'sub_table',
      ExpressionAttributeValues: {
        ':email': {
          S: email,
        },
      },
      KeyConditionExpression: "email = :email",
      ProjectionExpression: "aaaaa",
    }));

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
  } catch (error) {
    console.log('couldnt get items ');
  }

  res.render('sub.ejs', { subs, formError: null });
});

router.post('/sub', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
    return;
  }

  const { email } = req.session.user
  const { title, album } = req.body;

  const dbResponse = await dbClient.send(new PutItemCommand({
    TableName: 'sub_table',
    Item: {
      email: {
        S: email
      },
      title_album: {
        S: `${title}_${album}`
      },
    }
  }));

  console.log(dbResponse);

  res.redirect('/sub');
});

export default router;
