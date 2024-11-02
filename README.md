# WindTunnel

WindTunnel is a simple tool designed for stress testing based on the Solana base layer and layer 2 networks.

- Knowledge of Solana basics (Guide: [Introduction to Solana](https://docs.solana.com/introduction))
- Node.js (version 19 or higher) installed
- TypeScript and ts-node installed
- Solana CLI installed

## Dependencies Used in this Guide

| Dependency                | Version         |
|---------------------------|------------------|
| @solana/web3.js          | ^2.0.0 or higher |
| @solana-program/system     | ^0.5.0          |
| Solana CLI                | 2.0.0 or higher     |

### What is Solana Web3.js 2.0?

Solana Web3.js 2.0 is a significant update to the JavaScript library for interacting with the Solana blockchain. It introduces a new API design focusing on composability, modularity, and improved developer experience. Some key features include:

- **Functional API**: The new API uses a functional programming style, making it easier to compose complex operations.
- **Improved TypeScript support**: Better type inference and stricter types for enhanced code safety.
- **Modular design**: Functions are split into smaller, more focused modules, allowing for tree-shaking and smaller bundle sizes.
- **Enhanced error handling**: More informative error messages and improved error types.

For more information on changes to the API, check out our [Blog: What's New in Solana Web3.js 2.0](https://example.com).

## Let's Get Started!

~~~
mkdir WindTunnel && cd WindTunnel
~~~

Next, initialize your project as a Node.js project:

~~~
npm init -y
~~~

Install the dependencies:

~~~
npm install @solana/web3.js@2.0.0-rc.1 @solana-program/system && npm install --save-dev @types/node
~~~


~~~
tsc --init --resolveJsonModule true
~~~


Install pm2:

~~~
npm install pm2@latest -g
~~~


Run the script with single instance:
~~~
cd src
~~~


~~~
ts-node blow.ts config_default.json
~~~
or 
~~~
node blow.js config_default.json
~~~

Run with multiple instances using PM2:

~~~
pm2 start blow.js -- config_default.json
~~~

Then add 2 instances if you want:
~~~
pm2 scale blow +2
~~~





