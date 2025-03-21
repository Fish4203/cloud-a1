import {
  DynamoDBClient,
  PutItemCommand
  } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({ region: 'us-east-1' });



const putItemCommand = new PutItemCommand({
  TableName: TABLE_NAME, // required
  ReturnConsumedCapacity: "TOTAL",
  Item: { // MapAttributeValue
    "cool_key": {
      S: "fishKey"
    },
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
});

console.log(await dbClient.send(putItemCommand));