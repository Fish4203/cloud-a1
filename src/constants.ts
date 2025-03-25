import { error } from 'console';
import { createWriteStream } from 'fs';
import https from 'https';
import { pipeline } from 'stream';
import { inspect } from 'util';

export const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

export const transferFile = async (src: string) => {
  const srcUrl = new URL(src);

  return new Promise<void>((resolve, reject) => {
    // connect to source
    https.get(srcUrl, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(`failed to download file (${response.statusCode})`);
        return;
      }

      const writeStream = createWriteStream('./temp-img');

      // pipe content from source to destination
      pipeline(response, writeStream, (err) => {
        if (err) {
          console.error('file transfer failed', {
            error
          });
        }
      });

      // Handle errors in the upload request
      writeStream.on('error', (error) => {
        reject(`upload request error (${inspect(error)})`);
      });
      response.once('end', resolve);
    }).on('error', (error) => {
      reject(`download request error (${error})`);
    });
  });
};
