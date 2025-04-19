import { AttributeValue } from '@aws-sdk/client-dynamodb';
import jwt from "jsonwebtoken";

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

type userKeys = 'email' | 'password' | 'username'

export type IUser = Record<userKeys, string>;

export const toUser = (dbItem: Record<string, AttributeValue>) => {
  return { email: dbItem['email'].S, password: dbItem['password'].S, username: dbItem['username'].S } as IUser;
}

export type Music = {
  title: string,
  artist: string,
  year: string,
  album: string,
  image: string;
}

export const toMusic = (dbItem: Record<string, AttributeValue>) => {
  return {
    title: dbItem['title'].S,
    artist: dbItem['artist'].S,
    year: dbItem['year'].N,
    album: dbItem['album'].S,
    image: dbItem['img_url'].S
  } as Music;
}

export const jwtSecret = 'very-secret';

export const decodeToken = (cookies: unknown) => {
  if (typeof cookies !== 'object' || cookies === null) {
    return null;
  }

  if ('token' in cookies && typeof cookies['token'] === 'string') {
    const decodedToken = jwt.decode(cookies['token']);

    if (decodedToken && typeof decodedToken !== 'string' && 'username' in decodedToken && 'email' in decodedToken) {
      return { username: decodedToken['username'] as string, email: decodedToken['email'] as string}
    }
  }

  return null;
}

export const apiIp = 'https://add9lp2ibl.execute-api.us-east-1.amazonaws.com/default/cool'