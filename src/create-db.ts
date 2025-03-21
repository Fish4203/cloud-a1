import {
  DynamoDBClient,
  CreateTableCommand,
  } from '@aws-sdk/client-dynamodb';

  import { MUSIC_TABLE, USER_TABLE } from './constants.ts';


const dbClient = new DynamoDBClient({ region: 'us-east-1' });

const createUserTableCommand = new CreateTableCommand({
  AttributeDefinitions: [
    {
      AttributeName: "email",
      AttributeType: "S",
    },
  ],
  TableName: USER_TABLE,
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
  TableName: MUSIC_TABLE,
  KeySchema: [
    {
      AttributeName: "title",
      KeyType: "HASH",
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
    {
      KeySchema: [
        {
          AttributeName: "album",
          KeyType: "HASH",
        },
      ],
      Projection: {
        ProjectionType: "KEYS_ONLY"
      },
      IndexName: "album"
    }
  ]
});

const musicTableResponse = await dbClient.send(createMusicTableCommand);
const userTableResponse = await dbClient.send(createUserTableCommand);
console.log('create table responses', {
  userTableResponse,
  musicTableResponse
});
