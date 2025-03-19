import {
  DynamoDBClient,
  CreateTableCommand,
  PutItemCommand
  } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = 'user_table';

const dbClient = new DynamoDBClient({ region: 'us-east-1' });

const createTableCommand = new CreateTableCommand({
  AttributeDefinitions: [ // AttributeDefinitions // required
    { // AttributeDefinition
      AttributeName: "id", // required
      AttributeType: "S", // required
    },
  ],
  TableName: TABLE_NAME, // required
  KeySchema: [ // KeySchema // required
    { // KeySchemaElement
      AttributeName: "id", // required
      KeyType: "HASH", // required
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
});

console.log(await dbClient.send(createTableCommand));

const putItemCommand = new PutItemCommand({
  TableName: TABLE_NAME, // required
  Item: { // PutItemInputAttributeMap // required
    "fish": { // AttributeValue Union: only one key present
      M: { // MapAttributeValue
        "user_name": {//  Union: only one key present
          S: "fish",
        },
        "email": {//  Union: only one key present
          S: "fish@fish",
        },
        "password": {//  Union: only one key present
          S: "01234",
        },
      },
    },
  },
});

console.log(await dbClient.send(putItemCommand));