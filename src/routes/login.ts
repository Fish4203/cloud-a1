import * as express from "express";
import jwt from "jsonwebtoken";
import { apiIp, jwtSecret } from "../constants.ts";
import axios from "axios";

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login.ejs', { formError: undefined });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const response = await axios.post(apiIp, { messageType: 'login', email, password });
  const username = response.data['username'];

  if (username) {
    const token = jwt.sign({ username, email }, jwtSecret);
    res.cookie('token', token);
    res.redirect('/');
  } else {
    res.render('login.ejs', { formError: 'could not find user' });
  }
});

router.get('/register', (req, res) => {
  res.render('register.ejs', { formError: undefined });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const response = await axios.post(apiIp, { messageType: 'register', username, email, password });
  if (response.status === 200) {
    res.redirect('/login');
  } else {
    res.render('register.ejs', { formError: 'couldn\'t create user' });
  }
});

router.get('/logout', (req, res) => {
  res.cookie('token', undefined);
  res.redirect('/login');
});

export default router;
