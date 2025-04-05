import { BatchGetItemCommand, DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
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
    }));
    console.log(dbResponse);

    if (dbResponse.Items) {
      const subKeys = [];
      for (const item of dbResponse.Items) {
        console.log(item);
        const title_album = item['title_album'].S!.split('_')
        subKeys.push({
          title: { S: title_album[0] },
          album: { S: title_album[1] },
        });
      }
      console.log(subKeys);

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
    res.render('sub.ejs', { subs, formError: null });
  } catch (error) {
    console.log(error);
    res.render('sub.ejs', { subs, formError: 'couldn\'t find any items' });
  }
});

router.get('/sub', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const { email } = decodedToken;
  const { title_album } = req.query;

  const dbResponse = await dbClient.send(new PutItemCommand({
    TableName: 'sub_table',
    Item: {
      email: {
        S: email
      },
      title_album: {
        S: title_album as string
      },
    }
  }));

  console.log(dbResponse);

  res.redirect('/');
});

router.get('/unsub', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const { email } = decodedToken;
  const { title_album } = req.query;

  const dbResponse = await dbClient.send(new DeleteItemCommand({
    TableName: 'sub_table',
    Key: {
      email: {
        S: email
      },
      title_album: {
        S: title_album as string
      },
    }
  }));

  console.log(dbResponse);

  res.redirect('/');
});


export default router;
