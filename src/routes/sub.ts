import * as express from "express";
import { apiIp, decodeToken } from "../constants.ts";
import type { Music } from "../constants.ts";
import axios from "axios";

const router = express.Router();

router.get('/', async (req, res) => {
  const decodedToken = decodeToken(req.cookies);
  if (!decodedToken) {
    res.redirect('/login');
    return;
  }

  const { email } = decodedToken;

  const response = await axios.post(apiIp, { messageType: 'subs', email });
  const subs = response.data['subs'] as Music[];

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
  await axios.post(apiIp, { messageType: 'sub', email, title_album });

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

  await axios.post(apiIp, { messageType: 'unsub', email, title_album });

  res.redirect('/');
});


export default router;
