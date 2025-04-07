import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, 'lambda');
const distDir = path.join(__dirname, 'dist');

export default {
  mode: 'development',

  context: srcDir,
  entry: './handler.ts',
  target: 'node',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },

  externals: [
    'aws-sdk',
  ],

  output: {
    libraryTarget: 'commonjs2',
    path: distDir,
    filename: 'bundle.js',
  },
};
