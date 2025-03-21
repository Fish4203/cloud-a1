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
    {
      AttributeName: "img_url",
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
  LocalSecondaryIndexes: [
    {
      KeySchema: [
        {
          AttributeName: "title",
          KeyType: "HASH",
        },
        {
          AttributeName: "artist",
          KeyType: "RANGE",
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
          AttributeName: "title",
          KeyType: "HASH",
        },
        {
          AttributeName: "year",
          KeyType: "RANGE",
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
          AttributeName: "title",
          KeyType: "HASH",
        },
        {
          AttributeName: "album",
          KeyType: "RANGE",
        },
      ],
      Projection: {
        ProjectionType: "KEYS_ONLY"
      },
      IndexName: "album"
    }
  ]
});

// const userTableResponse = await dbClient.send(createUserTableCommand);
const musicTableResponse = await dbClient.send(createMusicTableCommand);
console.log('create table responses', {
  // userTableResponse,
  musicTableResponse
});
