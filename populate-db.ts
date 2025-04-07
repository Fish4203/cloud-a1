import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import https from 'https';

import songs from './2025a1.json' with { type: "json" };
const baseS3Url = 'https://ben-music-img.s3.us-east-1.amazonaws.com/'

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const userItems = [];

for (let i = 0; i < 10; i++) {
  userItems.push({
    PutRequest: {
      Item: {
        user_name: {
          S: `BenjaminRycroft${i}`,
        },
        email: {
          S: `s3947135${i}@student.rmit.edu.au`,
        },
        password: {
          S: `${i}${1+i%10}${2+i%10}${3+i%10}${4+i%10}${5+i%10}`,
        },
      },
    },
  })
};

const transferFile = async (src: string) => {
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
    }).on('error', (error) => {
      reject(`download request error (${error})`);
    });
  });
};

const userBulkWrite = new BatchWriteItemCommand({
  RequestItems: {
    'user_table': userItems
  },
});

const userCommandResponse = await dbClient.send(userBulkWrite);

console.log('write to user table', {
  userCommandResponse
});

while (songs.songs.length > 0) {
  const songRequests = []

  for (let i = 0; i < 25 && songs.songs.length > 0; i++) {
    const song = songs.songs.pop();
    if (!song) {
      break;
    }

    const imgBuffer = await transferFile(song.img_url);

    const imgKey = randomUUID();

    const command = new PutObjectCommand({ Bucket: 'ben-music-img', Key: imgKey, ContentType: 'image/png', Body: imgBuffer });
    console.log(await s3Client.send(command));

    songRequests.push({
      PutRequest: {
        Item: {
          title: {
            S: song.title,
          },
          artist: {
            S: song.artist,
          },
          year: {
            N: song.year,
          },
          album: {
            S: song.album,
          },
          img_url: {
            S: `${baseS3Url}${imgKey}`,
          },
        },
      },
    })
  };

  console.log(`adding ${songRequests.length} songs to db`);
  console.log('request response', {
    response: await dbClient.send(new BatchWriteItemCommand({ RequestItems: { music_table: songRequests }}))
  });
}
