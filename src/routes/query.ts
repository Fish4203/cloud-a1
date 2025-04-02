import { BatchGetItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import * as express from "express";
import { decodeToken, toMusic } from "../constants.ts";
import type { Music } from "../constants.ts";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = express.Router();

router.get('/query', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const dbResponse = await dbClient.send(new ScanCommand({
    TableName: "music_table"
  }));

  const music: Music[] = [];

  if (dbResponse.Items) {
    for (const item of dbResponse.Items) {
      music.push(toMusic(item));
    }
  }

  res.render('query.ejs', { music, formError: undefined });
});

router.post('/query', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const { title, year, album, artist } = req.body;

  let ExpressionAttributeValues = {};

  if (title !== '') {
    ExpressionAttributeValues = {
      ...ExpressionAttributeValues,
      title: {
        S: title
      }
    }
  }

  if (year !== '') {
    ExpressionAttributeValues = {
      ...ExpressionAttributeValues,
      year: {
        S: year
      }
    }
  }

  if (album !== '') {
    ExpressionAttributeValues = {
      ...ExpressionAttributeValues,
      album: {
        S: album
      }
    }
  }

  if (artist !== '') {
    ExpressionAttributeValues = {
      ...ExpressionAttributeValues,
      artist: {
        S: artist
      }
    }
  }

  const dbResponse = await dbClient.send(new QueryCommand({
    TableName: 'music_table',
    ExpressionAttributeValues,
  }));

  const music: Music[] = [];

  if (dbResponse.Items) {
    for (const item of dbResponse.Items) {
      music.push(toMusic(item));
    }
  }

  res.render('query.ejs', { music });
});

export default router;
