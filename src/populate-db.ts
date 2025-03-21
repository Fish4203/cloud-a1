import {
  DynamoDBClient,
  BatchWriteItemCommand,
  } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({ region: 'us-east-1' });

const userItems = []

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
}


const userBulkWrite = new BatchWriteItemCommand({
  RequestItems: {
    'user_table': userItems
  },
});

const userCommandResponse = await dbClient.send(userBulkWrite);

console.log('write table responses', {
  userCommandResponse
});


// const putItemCommand = new PutItemCommand({
//   TableName: TABLE_NAME, // required
//   ReturnConsumedCapacity: "TOTAL",
//   Item: { // MapAttributeValue
//     "cool_key": {
//       S: "fishKey"
//     },
//     "user_name": {//  Union: only one key present
//       S: "fish",
//     },
//     "email": {//  Union: only one key present
//       S: "fish@fish",
//     },
//     "password": {//  Union: only one key present
//       S: "01234",
//     },
//   },
// });

// console.log(await dbClient.send(putItemCommand));