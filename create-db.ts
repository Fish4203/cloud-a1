import {
  DynamoDBClient,
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
  waitUntilTableNotExists,
  } from '@aws-sdk/client-dynamodb';
import { CreateBucketCommand, PutBucketPolicyCommand, S3Client, waitUntilBucketExists } from '@aws-sdk/client-s3';

const dbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

// nuking
const tables = (await dbClient.send(new ListTablesCommand({}))).TableNames || [];

for (const table of tables) {
  console.log(`deleting table ${table}`);

  const deleteTableResponse = await dbClient.send(new DeleteTableCommand({ TableName: table }));

  console.log(deleteTableResponse);

  await waitUntilTableNotExists({ client: dbClient, maxWaitTime: 60 }, { TableName: table});
}

// creating
try {
  const createBucket = new CreateBucketCommand({ Bucket: 'ben-music-img' });

  console.log('creating s3 bucket', { response: await s3Client.send(createBucket) });
  await waitUntilBucketExists({ client: s3Client, maxWaitTime: 60 }, { Bucket: 'ben-music-img'});

  const putBucketPolocy = new PutBucketPolicyCommand({
    Bucket: 'ben-music-img',
    Policy: JSON.stringify({
      "Version":"2012-10-17",
      "Statement":[
        {
          "Sid":"PublicRead",
          "Effect":"Allow",
          "Principal": "*",
          "Action":["s3:GetObject"],
          "Resource":["arn:aws:s3:::ben-music-img/*"]
        }
      ]
    }),
  });

  console.log('creating s3 bucket access', { response: await s3Client.send(putBucketPolocy) });
} catch (error) {
  console.log('bucket already exists', error);
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

const createSubscriptionTableCommand = new CreateTableCommand({
  AttributeDefinitions: [
    {
      AttributeName: "email",
      AttributeType: "S",
    },
    {
      AttributeName: "title_album",
      AttributeType: "S",
    },
  ],
  TableName: 'sub_table',
  KeySchema: [
    {
      AttributeName: "email",
      KeyType: "HASH",
    },
    {
      AttributeName: "title_album",
      KeyType: "RANGE",
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
});

const userTableResponse = await dbClient.send(createUserTableCommand);
const musicTableResponse = await dbClient.send(createMusicTableCommand);
const subscriptionTableResponse = await dbClient.send(createSubscriptionTableCommand);
console.log('create table responses', {
  userTableResponse,
  musicTableResponse,
  subscriptionTableResponse
});
