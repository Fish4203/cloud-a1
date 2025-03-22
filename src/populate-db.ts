import {
  DynamoDBClient,
  BatchWriteItemCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';

import { sleep } from './constants.ts';

import songs from '../2025a1.json' with { type: "json" };

const dbClient = new DynamoDBClient({ region: 'us-east-1' });

let existingTables: string[] = [];

while (!existingTables.includes('user_table') || !existingTables.includes('music_table')) {
  sleep(1000);
  existingTables = (await dbClient.send(new ListTablesCommand({}))).TableNames || [];
}

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
            S: song.img_url,
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
