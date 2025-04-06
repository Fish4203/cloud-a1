import { BatchGetItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";
import { apiIp, decodeToken, toMusic } from "../constants.ts";
import type { Music } from "../constants.ts";
import axios from "axios";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = express.Router();

if (apiIp) {
  router.get('/query', async (req, res) => {
    const decodedToken = decodeToken(req.cookies);
    if (!decodedToken) {
      res.redirect('/login');
      return;
    }

    const music = await query(undefined, undefined);

    res.render('query.ejs', { music, formError: undefined, username: decodedToken.username });
  });

  router.post('/query', async (req, res) => {
    const decodedToken = decodeToken(req.cookies);
    if (!decodedToken) {
      res.redirect('/login');
      return;
    }

    const { title, year, album, artist } = req.body;

    let ExpressionAttributeValues = {};
    const keyConditions = []

    if (title !== '') {
      ExpressionAttributeValues = {
        ...ExpressionAttributeValues,
        ':title': {
          S: title
        }
      }

      keyConditions.push('title = :title');
    }

    if (year !== '') {
      ExpressionAttributeValues = {
        ...ExpressionAttributeValues,
        ':year': {
          S: year
        }
      }
      keyConditions.push('year = :year');
    }

    if (album !== '') {
      ExpressionAttributeValues = {
        ...ExpressionAttributeValues,
        ':album': {
          S: album
        }
      }
      keyConditions.push('album = :album');
    }

    if (artist !== '') {
      ExpressionAttributeValues = {
        ...ExpressionAttributeValues,
        ':artist': {
          S: artist
        }
      }
      keyConditions.push('artist = :artist');
    }

    if (keyConditions.length === 0) {
      res.render('query.ejs', { music: [], formError: 'No result is retrieved. Please query again' });
      return;
    }

    const response = await axios.post(`${apiIp}/api/query`, { ExpressionAttributeValues, keyConditions });
    const music = response.data['music'] as Music[];

    res.render('query.ejs', { music, formError: music.length === 0 ? 'No result is retrieved. Please query again' : null, username: decodedToken.username });
  });
} else {
  router.post('/api/query', async (req, res) => {
    const { ExpressionAttributeValues, keyConditions } = req.body;

    const music = await query(ExpressionAttributeValues, keyConditions);

    res.json({ music });
  });
}

const query = async (ExpressionAttributeValues: any, keyConditions: string[] | undefined) => {
  const music: Music[] = [];
  try {
    const dbResponse = await dbClient.send(new ScanCommand({
      TableName: 'music_table',
      ExpressionAttributeValues,
      FilterExpression: keyConditions ? keyConditions.join(' AND ') : undefined,
    }));


    if (dbResponse.Items) {
      for (const item of dbResponse.Items) {
        music.push(toMusic(item));
      }
    }
  } catch (error) {
    console.log(error);
  }
  return music;
}

export default router;
