import { BatchGetItemCommand, DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";
import { apiIp, decodeToken, toMusic } from "../constants.ts";
import type { Music } from "../constants.ts";
import axios from "axios";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = express.Router();

if (apiIp) {
  router.get('/', async (req, res) => {
    const decodedToken = decodeToken(req.cookies);
    if (!decodedToken) {
      res.redirect('/login');
      return;
    }

    const { email } = decodedToken;

    const response = await axios.post(`${apiIp}/api/subs`, { email });
    const subs = response.data['music'] as Music[];

    res.render('sub.ejs', { subs, formError: null, username: decodedToken.username });
  });

  router.get('/sub', async (req, res) => {
    const decodedToken = decodeToken(req.cookies);
    if (!decodedToken) {
      res.redirect('/login');
      return;
    }

    const { email } = decodedToken;
    const { title_album } = req.query;
    await axios.post(`${apiIp}/api/sub`, { email, title_album });

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

    await axios.post(`${apiIp}/api/unsub`, { email, title_album });

    res.redirect('/');
  });
} else {
  router.post('/api/subs', async (req, res) => {
    const { email } = req.body;

    const music = await getSubs(email);

    res.json({ music });
  });

  router.post('/api/sub', async (req, res) => {
    const { email, title_album } = req.body;

    await sub(email, title_album);

    res.sendStatus(200);
  });

  router.post('/api/unsub', async (req, res) => {
    const { email, title_album } = req.body;

    await unsub(email, title_album);

    res.sendStatus(200);
  });
}

const sub = async (email: string, title_album: string) => {
  const dbResponse = await dbClient.send(new PutItemCommand({
    TableName: 'sub_table',
    Item: {
      email: {
        S: email
      },
      title_album: {
        S: title_album
      },
    }
  }));

  console.log(dbResponse);
};

const unsub = async (email: string, title_album: string) => {
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
};

const getSubs = async (email: string) => {
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

    return subs;
  } catch (error) {
    console.log(error);
    return subs;
  }
};

export default router;
