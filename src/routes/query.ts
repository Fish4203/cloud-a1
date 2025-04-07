import * as express from "express";
import { apiIp, decodeToken, toMusic } from "../constants.ts";
import type { Music } from "../constants.ts";
import axios from "axios";

const router = express.Router();

router.get('/query', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const response = await axios.post(`${apiIp}/api/query`, {});
  const music = response.data['music'] as Music[];

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

  const response = await axios.post(`${apiIp}/query`, { ExpressionAttributeValues, keyConditions });
  const music = response.data['music'] as Music[];

  res.render('query.ejs', { music, formError: music.length === 0 ? 'No result is retrieved. Please query again' : null, username: decodedToken.username });
});

export default router;
