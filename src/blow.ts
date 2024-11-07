// Author: yussufier@gmail.com
// Description: 
// WindTunnel is a simple tool designed for stress testing applications 
// built on the Solana blockchain, including both the base layer and layer 2 networks. 
// This tool allows developers to simulate high-load scenarios, 
// measure performance metrics, and identify potential bottlenecks 
// in their applications. It provides functionalities to create 
// multiple transactions, monitor response times, and evaluate 
// the overall stability of the network under stress conditions.

// ref -> https://www.quicknode.com/guides/solana-development/tooling/web3-2/transfer-sol
// npm install @solana/web3.js@2.0.0-rc.1 @solana-program/system && npm install --save-dev @types/node
// tsc --init --resolveJsonModule true
import {
    airdropFactory,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    generateKeyPairSigner,
    lamports,
    sendAndConfirmTransactionFactory,
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstruction,
    signTransactionMessageWithSigners,
    getSignatureFromTransaction,
    address,
    createSignerFromKeyPair,
    sendTransactionWithoutConfirmingFactory
} from "@solana/web3.js";

import { getTransferSolInstruction } from "@solana-program/system";
import { config } from "process";

const LAMPORTS_PER_SOL = BigInt(1_000_000_000);

const fs = require('fs');
const path = require('path');


// Load configuration file
function loadConfig(filePath: string) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to read configuration file:", error);
        throw error; // Rethrow the error for the caller to handle
    }
}

// Read all files in the directory
async function initializeKeypairSignerArray(directoryPath: string, keypairSignerArray: Uint8Array[]) {
    return new Promise<void>((resolve, reject) => {
        fs.readdir(directoryPath, (err: NodeJS.ErrnoException | null, files: string[]) => {
            if (err) {
                return reject('Failed to read directory: ' + err);
            }

            const readPromises = files.slice(0, 300).map(file => {
                return new Promise<void>((resolveFile, rejectFile) => {
                    if (path.extname(file) === '.json') {
                        const filePath = path.join(directoryPath, file);
                        fs.readFile(filePath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
                            if (err) {
                                return rejectFile('Failed to read file: ' + err);
                            }
                            try {
                                const jsonData = JSON.parse(data);
                                const uint8Array = new Uint8Array(Object.values(jsonData));
                                keypairSignerArray.push(uint8Array);
                                resolveFile();
                            } catch (parseError) {
                                rejectFile('Failed to parse JSON: ' + parseError);
                            }
                        });
                    } else {
                        resolveFile();
                    }
                });
            });

            Promise.all(readPromises).then(() => resolve()).catch(reject);
        });
    });
}

let cachedBlockhash: any | null = null; // Used to cache the latest blockhash
let blockhashTimestamp: number = 0; // Used to record the time of fetching the blockhash

async function getLatestBlockhash(rpc: any) {
    const currentTime = Date.now();
    // If the cached blockhash does not exist or has expired (more than 100 milliseconds), fetch it again
    if (!cachedBlockhash || (currentTime - blockhashTimestamp > 100)) {
        const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
        cachedBlockhash = latestBlockhash; // Cache the blockhash
        blockhashTimestamp = currentTime; // Update the timestamp
    }
    return cachedBlockhash;
}

// async function transfer_lamports() {
//     const transaction = new Transaction();
//     let ix = SystemProgram.transfer({
//     fromPubkey: feePayer.publicKey,
//     toPubkey: sonic_data_account,
//     lamports: 1000000,
//     });
//     transaction.add(ix);
    
//     connection.sendTransaction(transaction, [feePayer]).then((signature) => {
//     console.log('tx signature:', signature);
//     }).catch((error) => {
//     console.error('Error:', error);
//    });
// }


// Function to create a transfer transaction
async function _transfer(rpc: any, rpcSubscriptions: any, user1: any, user2: any, amount: bigint) {

    const latestBlockhash = await getLatestBlockhash(rpc); // Get the latest blockhash
   
    const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        tx => setTransactionMessageFeePayer(user1.address, tx),
        tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        tx => appendTransactionMessageInstruction(
            getTransferSolInstruction({
                amount: lamports(amount),
                destination: user2.address,
                source: user1,
            }),
            tx
        )
    );
    
    const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
    const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
    
    try {
        
        await sendAndConfirmTransaction(
            signedTransaction,
            { commitment: 'confirmed', skipPreflight: true }
        );
        const signature = getSignatureFromTransaction(signedTransaction);
        const timestamp = new Date().toISOString(); // get current timestamp
        // write to blow.log
        fs.appendFile(logBlowPath, `[${timestamp}] Transaction.transfer: ${signature}\n`, (err: NodeJS.ErrnoException | null) => {
            if (err) {
                console.error("Failed to write to log file:", err);
            }
        });
    } catch (e) {
        // console.error('Transfer failed:', e);
    }
}

// Function to airdrop SOL
async function _airdrop(rpc: any, user1: any) {
    try {

        const tx1 = await rpc.requestAirdrop(
            user1.address,
            lamports(LAMPORTS_PER_SOL),
            { commitment: 'processed' }
        ).send();
        console.log(`✅ - user airdropped ${Number(LAMPORTS_PER_SOL) / 1000000000} SOL using RPC methods`);
        console.log(`✅ - tx: ${tx1}`);
    } catch (error) {
        console.error("Airdrop failed:", error);
    }
}

// Function to airdrop using factory function
async function _airdrop2(rpc: any, rpcSubscriptions: any, user2: any) {
    try {
        // Using factory function
        const airdrop = airdropFactory({ rpc, rpcSubscriptions });
        const tx1 = await airdrop({
            commitment: 'processed',
            lamports: lamports(LAMPORTS_PER_SOL),
            recipientAddress: user2.address
        });
        console.log(`✅ - user airdropped ${Number(LAMPORTS_PER_SOL) / 1000000000} SOL using Factory Function`);
        console.log(`✅ - tx: ${tx1}`);
    } catch (error) {
        console.error("Airdrop failed:", error);
    }
}


function getRandomElements(arr: any[], count: number): any[] {
    /// Create a copy to avoid modifying the original array
    const shuffled = [...arr];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Generate random index
        // Swap elements
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return the first count elements
    return shuffled.slice(0, count);
}

async function getBalance(rpc: any, pubkey: string) {
    try {
        const { value: lamports } = await rpc.getBalance(pubkey).send();
        return Number(lamports) / Number(LAMPORTS_PER_SOL);
    }
    catch (e) {
        console.log(e);
        return -1
    }
}

async function initializeSignerBalance(rpc: any, rpcSubscriptions: any, payer: any, keypairSignerList: any[]) {
    const balancePromises = keypairSignerList.map(async (signer) => {
        const balance = await getBalance(rpc, signer.address);
        if (balance < 10) {
            const amount = BigInt(Math.floor((50 - balance) * Number(LAMPORTS_PER_SOL)));
            await _transfer(rpc, rpcSubscriptions, payer, signer, amount);
            console.log(`${signer.address} balance is insufficient, recharged ${50 - balance} SOL, current balance: 50.0 SOL`);
        } else {
            console.log(`${signer.address} has sufficient balance`);
        }
    });

    await Promise.all(balancePromises); // Execute all balance queries and transfers in parallel
}

// Iterate over keypairSignerArray and convert elements to keypairSignerList
async function initializeKeypairSigners(keypairSignerArray: Uint8Array[], keypairSignerList: any[]) {
    for (const bytes of keypairSignerArray) {
        try {
            const signer = await createKeyPairSignerFromBytes(bytes);
            keypairSignerList.push(signer);
        } catch (error) {
            console.error("Failed to create signer:", error);
        }
    }
}

// Execute 1000 transfers
async function executeTransfers(rpc: any, rpcSubscriptions: any, amount: bigint, keypairSignerList: any[]) {
    const transferPromises = []; // Array to store all transfer promises

    // Infinite loop
    let a = true;
    while (a) {
        // Randomly select two elements
        const [user1, user2] = getRandomElements(keypairSignerList, 2);

        // Create a transfer promise
        const transferPromise = _transfer(rpc, rpcSubscriptions, user1, user2, amount)
        transferPromises.push(transferPromise); // Add promise to the array

        // Control the number of concurrent executions to avoid too many requests
        if (transferPromises.length >= 500) {
            await Promise.all(transferPromises); // Execute all transfers in parallel
            transferPromises.length = 0; // Clear the array
        }
        // a = false;
    }
}

let logBlowPath: string;  // Declare global variable
async function main() {
    // Get the configuration file path from command line arguments
    const args = process.argv.slice(2);
    const configPath = args[0] || 'config_default.json'; // The first argument is the configuration file path

    if (!configPath) {
        console.error("Please provide the configuration file path as a command line argument. For example:  ts-node blow.ts config.json");
        process.exit(1);
    }

    const config = loadConfig(configPath);

    const directoryPath = config.directoryPath;
    const httpProvider = config.httpProvider;
    const wssProvider = config.wssProvider;
    const payerArray = new Uint8Array(config.payerArray);
    const logPath = config.logPath;

    const keypairSignerArray: Uint8Array[] = [];
    const keypairSignerList: any[] = [];
    let cachedBlockhash: any | null = null;
    let blockhashTimestamp: number = 0;

    const rpc = createSolanaRpc(httpProvider);
    // Check if RPC creation was successful
    if (!rpc) {
        console.error("Failed to create RPC connection.");
        process.exit(1); // Exit the program
    } else {
        console.log("RPC connection created successfully.");
    }

    const rpcSubscriptions = createSolanaRpcSubscriptions(wssProvider);
    // Check if RPC subscriptions creation was successful
    if (!rpcSubscriptions) {
        console.error("Failed to create RPC subscriptions.");
        process.exit(1); // Exit the program
    } else {
        console.log("RPC subscriptions created successfully.");
    }

    const payer = await createKeyPairSignerFromBytes(payerArray);

    logBlowPath = path.join(logPath, 'blow.log');
    fs.mkdirSync(path.dirname(logBlowPath), { recursive: true });
    // Check if the file exists, if it does, rename it
    if (fs.existsSync(logBlowPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format timestamp
        const newLogPath = path.join(logPath, `blow_${timestamp}.log`); // New file name
        fs.renameSync(logBlowPath, newLogPath); // Rename file
    }

    await initializeKeypairSignerArray(directoryPath, keypairSignerArray);
    console.log(`Directory reading completed, read ${keypairSignerArray.length} key pairs`);
    await initializeKeypairSigners(keypairSignerArray, keypairSignerList);
   
    await initializeSignerBalance(rpc, rpcSubscriptions, payer, keypairSignerList);
    console.log(`All signer balances initialized`);

    // Ensure there are enough elements in keypairSignerList
    if (keypairSignerList.length < 2) {
        console.error(`Insufficient elements in keypairSignerList, unable to execute the transfer`);
        return;
    }
    console.log(`Running ... ...`);
    // Execute transfers
    const amount = BigInt(1_000); // Set transfer amount in Lamports
    await executeTransfers(rpc, rpcSubscriptions, amount, keypairSignerList);

}

main();
