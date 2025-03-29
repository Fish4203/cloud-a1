import { BatchGetItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Request, Response, Router } from "express";
import { Music, toMusic } from "../constants";

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const router = Router();

router.get('/query', async (req, res) => {
  if (!req.session.user) {
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

  res.render('query', { music });
});

export default router;
