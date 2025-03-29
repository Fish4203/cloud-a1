import { AttributeValue } from '@aws-sdk/client-dynamodb';
import https from 'https';

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

export const transferFile = async (src: string) => {
  const srcUrl = new URL(src);



  return new Promise<Buffer>((resolve, reject) => {
    // connect to source
    https.get(srcUrl, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(`failed to download file (${response.statusCode})`);
        return;
      }

      // @ts-ignore
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });

      response.on("end", () => {
        // @ts-ignore
        resolve(Buffer.concat(chunks));
      });

      response.once('end', resolve);
    }).on('error', (error) => {
      reject(`download request error (${error})`);
    });
  });
};

enum userKeys {
  EMAIL = 'email',
  PASSWORD = 'password',
  USERNAME = 'username'
}

export type IUser = Record<userKeys, string>;

export const toUser = (dbItem: Record<string, AttributeValue>) => {
  return { email: dbItem['email'].S, password: dbItem['password'].S, username: dbItem['username'].S } as IUser;
}