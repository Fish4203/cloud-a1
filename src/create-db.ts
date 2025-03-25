import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
  } from '@aws-sdk/client-dynamodb';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { sleep } from './constants.ts';

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const command = new CreateBucketCommand({ Bucket: "ben-music-img" });

console.log('creating s3 bucket', { response: await s3Client.send(command) });

const deleteUserTablesCommand = new DeleteTableCommand({ TableName: 'user_table' });
const deleteMusicTablesCommand = new DeleteTableCommand({ TableName: 'music_table' });


try {
  const deleteMusicTableResponse = await dbClient.send(deleteMusicTablesCommand);

  console.log('deleting music table ', {
    deleteMusicTableResponse,
  });
} catch (error) {
  console.log('failed to delete music table', {
    error
  });
}

try {
  const deleteUserTableResponse = await dbClient.send(deleteUserTablesCommand);

  console.log('deleting user table ', {
    deleteUserTableResponse,
  });
} catch (error) {
  console.log('failed to delete user table', {
    error
  });
}

let existingTables: string[] = [];

while (existingTables.includes('user_table') || existingTables.includes('music_table')) {
  sleep(1000);
  existingTables = (await dbClient.send(new ListTablesCommand({}))).TableNames || [];
}

const createUserTableCommand = new CreateTableCommand({
  AttributeDefinitions: [
    {
      AttributeName: "email",
      AttributeType: "S",
    },
  ],
  TableName: 'user_table',
  KeySchema: [
    {
      AttributeName: "email",
      KeyType: "HASH",
    },

  ],
  BillingMode: "PAY_PER_REQUEST",
});

const createMusicTableCommand = new CreateTableCommand({
  AttributeDefinitions: [
    {
      AttributeName: "title",
      AttributeType: "S",
    },
    {
      AttributeName: "artist",
      AttributeType: "S",
    },
    {
      AttributeName: "year",
      AttributeType: "N",
    },
    {
      AttributeName: "album",
      AttributeType: "S",
    },
  ],
  TableName: 'music_table',
  KeySchema: [
    {
      AttributeName: "title",
      KeyType: "HASH",
    },
    {
      AttributeName: "album",
      KeyType: "RANGE",
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
  GlobalSecondaryIndexes: [
    {
      KeySchema: [
        {
          AttributeName: "artist",
          KeyType: "HASH",
        },
      ],
      Projection: {
        ProjectionType: "KEYS_ONLY"
      },
      IndexName: "artist"
    },
    {
      KeySchema: [
        {
          AttributeName: "year",
          KeyType: "HASH",
        },
      ],
      Projection: {
        ProjectionType: "KEYS_ONLY"
      },
      IndexName: "year"
    },
  ]
});

const musicTableResponse = await dbClient.send(createMusicTableCommand);
const userTableResponse = await dbClient.send(createUserTableCommand);
console.log('create table responses', {
  userTableResponse,
  musicTableResponse
});
