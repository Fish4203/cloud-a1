import { AttributeValue, BatchGetItemCommand, DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
const dbClient = new DynamoDBClient({ region: 'us-east-1' });

const LAMBDA_PATH = process.env.LAMBDA_PATH;

Object.defineProperty(Error.prototype, 'toJSON', {
  value() {
    return Object.getOwnPropertyNames(this).reduce((alt, key) => ({
      ...alt,
      [key]: this[key]
    }), {});
  },
  configurable: true,
  writable: true
});

type HttpMethod = 'GET' | 'OPTIONS' | 'POST' | 'PUT' | 'DELETE';

interface Event {
  body?: string;
  headers: Record<string, string>;
  httpMethod: HttpMethod;
  path: string;
}

interface Response {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
}

const generateResponse = (statusCode: number, body?: unknown) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  const response: APIGatewayProxyResult = {
    statusCode,
    headers,
    body: ""
  };

  if (body && response.headers) {
    response.headers['Content-Type'] = 'application/json; charset=UTF-8',
    response.body = JSON.stringify(body);
  }

  return response;
};

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const { body, httpMethod } = event;

  if (httpMethod === 'OPTIONS') {
    return generateResponse(200);
  }

  if (!body) {
    return generateResponse(400);
  }

  const data = JSON.parse(body);
  const { messageType } = data;

  switch (messageType) {
    case `login`:
      return await login(data['email'], data['password']);
    case `register`:
      return await register(data['username'], data['email'], data['password']);
    case `query`:
      return await query(data['ExpressionAttributeValues'], data['keyConditions']);
    case `subs`:
      return await getSubs(data['email']);
    case `sub`:
      return await sub(data['email'], data['title_album']);
    case `unsub`:
      return await unsub(data['email'], data['title_album']);
    default:
      return generateResponse(404);
  }
};

const register = async (username: string, email: string, password: string) => {
  try {
    const dbResponse = await dbClient.send(new PutItemCommand({
      TableName: 'user_table',
      Item: {
        user_name: {
          S: username,
        },
        email: {
          S: email,
        },
        password: {
          S: password,
        },
      },
    }));

    if (dbResponse.$metadata.httpStatusCode !== 200) {
      return generateResponse(200);
    }
  } catch (error) {
    return generateResponse(200);
  }

  return generateResponse(200);
};

const login = async (email: string, password: string) => {
  try {
    const dbResponse = await dbClient.send(new GetItemCommand({
      TableName: 'user_table',
      Key: {
        email: {
          S: email,
        },
      },
    }));

    if (!dbResponse.Item || !dbResponse.Item['user_name'] || !dbResponse.Item['user_name'].S) {
      return generateResponse(400);
    }

    if (dbResponse.Item['password'].S !== password) {
      return generateResponse(400);
    }

    return generateResponse(200, { username: dbResponse.Item['user_name'].S });
  } catch (error) {
    return generateResponse(400);
  }
};

const sub = async (email: string, title_album: string) => {
  const dbResponse = await dbClient.send(new PutItemCommand({
    TableName: 'sub_table',
    Item: {
      email: {
        S: email
      },
      title_album: {
        S: title_album
      },
    }
  }));

  console.log(dbResponse);

  return generateResponse(200);
};

const unsub = async (email: string, title_album: string) => {
  const dbResponse = await dbClient.send(new DeleteItemCommand({
    TableName: 'sub_table',
    Key: {
      email: {
        S: email
      },
      title_album: {
        S: title_album as string
      },
    }
  }));

  console.log(dbResponse);

  return generateResponse(200);
};

const getSubs = async (email: string) => {
  const subs: Music[] = [];

  try {
    const dbResponse = await dbClient.send(new QueryCommand({
      TableName: 'sub_table',
      ExpressionAttributeValues: {
        ':email': {
          S: email,
        },
      },
      KeyConditionExpression: "email = :email",
    }));
    console.log(dbResponse);

    if (dbResponse.Items) {
      const subKeys = [];
      for (const item of dbResponse.Items) {
        console.log(item);
        const title_album = item['title_album'].S!.split('_')
        subKeys.push({
          title: { S: title_album[0] },
          album: { S: title_album[1] },
        });
      }
      console.log(subKeys);

      const dbResponseBatch = await dbClient.send(new BatchGetItemCommand({
        RequestItems: {
          music_table: {
            Keys: subKeys
          }
        }
      }));

      if (dbResponseBatch.Responses) {
        for (const sub of dbResponseBatch.Responses['music_table']) {
          subs.push(toMusic(sub));
        }
      }
    }

  } catch (error) {
    console.log(error);
  }

  return generateResponse(200, { subs });
};

const query = async (ExpressionAttributeValues: any, keyConditions: string[] | undefined) => {
  const music: Music[] = [];
  try {
    const dbResponse = await dbClient.send(new ScanCommand({
      TableName: 'music_table',
      ExpressionAttributeValues,
      FilterExpression: keyConditions ? keyConditions.join(' AND ') : undefined,
    }));


    if (dbResponse.Items) {
      for (const item of dbResponse.Items) {
        music.push(toMusic(item));
      }
    }
  } catch (error) {
    console.log(error);
  }

  return generateResponse(200, { music });
}

export type Music = {
  title: string,
  artist: string,
  year: string,
  album: string,
  image: string;
}

export const toMusic = (dbItem: Record<string, AttributeValue>) => {
  return {
    title: dbItem['title'].S,
    artist: dbItem['artist'].S,
    year: dbItem['year'].N,
    album: dbItem['album'].S,
    image: dbItem['img_url'].S
  } as Music;
}
