"use strict";
// Author: yussufier@gmail.com
// Description: 
// WindTunnel is a simple tool designed for stress testing applications 
// built on the Solana blockchain, including both the base layer and layer 2 networks. 
// This tool allows developers to simulate high-load scenarios, 
// measure performance metrics, and identify potential bottlenecks 
// in their applications. It provides functionalities to create 
// multiple transactions, monitor response times, and evaluate 
// the overall stability of the network under stress conditions.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// ref -> https://www.quicknode.com/guides/solana-development/tooling/web3-2/transfer-sol
// npm install @solana/web3.js@2.0.0-rc.1 @solana-program/system && npm install --save-dev @types/node
// tsc --init --resolveJsonModule true
var web3_js_1 = require("@solana/web3.js");
var system_1 = require("@solana-program/system");
var LAMPORTS_PER_SOL = BigInt(1000000000);
var fs = require('fs');
var path = require('path');
// Load configuration file
function loadConfig(filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error("Failed to read configuration file:", error);
        throw error; // Rethrow the error for the caller to handle
    }
}
// Read all files in the directory
function initializeKeypairSignerArray(directoryPath, keypairSignerArray) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    fs.readdir(directoryPath, function (err, files) {
                        if (err) {
                            return reject('Failed to read directory: ' + err);
                        }
                        var readPromises = files.slice(0, 1000).map(function (file) {
                            return new Promise(function (resolveFile, rejectFile) {
                                if (path.extname(file) === '.json') {
                                    var filePath = path.join(directoryPath, file);
                                    fs.readFile(filePath, 'utf8', function (err, data) {
                                        if (err) {
                                            return rejectFile('Failed to read file: ' + err);
                                        }
                                        try {
                                            var jsonData = JSON.parse(data);
                                            var uint8Array = new Uint8Array(Object.values(jsonData));
                                            keypairSignerArray.push(uint8Array);
                                            resolveFile();
                                        }
                                        catch (parseError) {
                                            rejectFile('Failed to parse JSON: ' + parseError);
                                        }
                                    });
                                }
                                else {
                                    resolveFile();
                                }
                            });
                        });
                        Promise.all(readPromises).then(function () { return resolve(); }).catch(reject);
                    });
                })];
        });
    });
}
var cachedBlockhash = null; // Used to cache the latest blockhash
var blockhashTimestamp = 0; // Used to record the time of fetching the blockhash
function getLatestBlockhash(rpc) {
    return __awaiter(this, void 0, void 0, function () {
        var currentTime, latestBlockhash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentTime = Date.now();
                    if (!(!cachedBlockhash || (currentTime - blockhashTimestamp > 100))) return [3 /*break*/, 2];
                    return [4 /*yield*/, rpc.getLatestBlockhash().send()];
                case 1:
                    latestBlockhash = (_a.sent()).value;
                    cachedBlockhash = latestBlockhash; // Cache the blockhash
                    blockhashTimestamp = currentTime; // Update the timestamp
                    _a.label = 2;
                case 2: return [2 /*return*/, cachedBlockhash];
            }
        });
    });
}
function getBlockHeight(rpc) {
    return __awaiter(this, void 0, void 0, function () {
        var blockHeight, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, rpc.getBlockHeight().send()];
                case 1:
                    blockHeight = _a.sent();
                    console.log("\u5F53\u524D\u533A\u5757\u9AD8\u5EA6: ".concat(blockHeight));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("获取区块高度时出错:", error_1);
                    throw error_1; // 抛出错误以便调用者处理
                case 3: return [2 /*return*/];
            }
        });
    });
}
//npm install node-fetch
// import fetch from 'node-fetch';
var count_getBlockHeight2 = 0;
function getBlockHeight2(rpc_url) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, randomId, body, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                    };
                    randomId = Math.floor(Math.random() * 100000);
                    body = JSON.stringify({
                        id: randomId,
                        jsonrpc: '2.0',
                        method: 'getBlockHeight',
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(rpc_url, {
                            method: 'POST',
                            headers: headers,
                            body: body,
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.result) {
                        console.log("(".concat(count_getBlockHeight2, "), id:").concat(data.id, ", slot:").concat(data.result));
                        count_getBlockHeight2 += 1;
                        return [2 /*return*/, data.result]; // 返回区块高度
                    }
                    else {
                        throw new Error('Invalid response structure');
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('获取区块高度时出错:', error_2);
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
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
function _transfer(rpc, rpcSubscriptions, user1, user2, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var latestBlockhash, transactionMessage, signedTransaction, sendAndConfirmTransaction, signature, timestamp, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getLatestBlockhash(rpc)];
                case 1:
                    latestBlockhash = _a.sent();
                    transactionMessage = (0, web3_js_1.pipe)((0, web3_js_1.createTransactionMessage)({ version: 0 }), function (tx) { return (0, web3_js_1.setTransactionMessageFeePayer)(user1.address, tx); }, function (tx) { return (0, web3_js_1.setTransactionMessageLifetimeUsingBlockhash)(latestBlockhash, tx); }, function (tx) { return (0, web3_js_1.appendTransactionMessageInstruction)((0, system_1.getTransferSolInstruction)({
                        amount: (0, web3_js_1.lamports)(amount),
                        destination: user2.address,
                        source: user1,
                    }), tx); });
                    return [4 /*yield*/, (0, web3_js_1.signTransactionMessageWithSigners)(transactionMessage)];
                case 2:
                    signedTransaction = _a.sent();
                    sendAndConfirmTransaction = (0, web3_js_1.sendAndConfirmTransactionFactory)({ rpc: rpc, rpcSubscriptions: rpcSubscriptions });
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, sendAndConfirmTransaction(signedTransaction, { commitment: 'confirmed', skipPreflight: true })];
                case 4:
                    _a.sent();
                    signature = (0, web3_js_1.getSignatureFromTransaction)(signedTransaction);
                    timestamp = new Date().toISOString();
                    // write to blow.log
                    fs.appendFile(logBlowPath, "[".concat(timestamp, "] Transaction.transfer: ").concat(signature, "\n"), function (err) {
                        if (err) {
                            console.error("Failed to write to log file:", err);
                        }
                    });
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Function to airdrop SOL
function _airdrop(rpc, user1) {
    return __awaiter(this, void 0, void 0, function () {
        var tx1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, rpc.requestAirdrop(user1.address, (0, web3_js_1.lamports)(LAMPORTS_PER_SOL), { commitment: 'processed' }).send()];
                case 1:
                    tx1 = _a.sent();
                    console.log("\u2705 - user airdropped ".concat(Number(LAMPORTS_PER_SOL) / 1000000000, " SOL using RPC methods"));
                    console.log("\u2705 - tx: ".concat(tx1));
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Airdrop failed:", error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Function to airdrop using factory function
function _airdrop2(rpc, rpcSubscriptions, user2) {
    return __awaiter(this, void 0, void 0, function () {
        var airdrop, tx1, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    airdrop = (0, web3_js_1.airdropFactory)({ rpc: rpc, rpcSubscriptions: rpcSubscriptions });
                    return [4 /*yield*/, airdrop({
                            commitment: 'processed',
                            lamports: (0, web3_js_1.lamports)(LAMPORTS_PER_SOL),
                            recipientAddress: user2.address
                        })];
                case 1:
                    tx1 = _a.sent();
                    console.log("\u2705 - user airdropped ".concat(Number(LAMPORTS_PER_SOL) / 1000000000, " SOL using Factory Function"));
                    console.log("\u2705 - tx: ".concat(tx1));
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error("Airdrop failed:", error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getRandomElements(arr, count) {
    if (count < 1) {
        console.error("count 必须大于 0");
        return null; // 如果 count 小于 1，返回 null
    }
    if (arr.length < count) {
        console.error("数组中元素不足以选择所需数量的不同元素");
        return null; // 如果数组中元素不足，返回 null
    }
    // 使用 Fisher-Yates 洗牌算法
    var result = [];
    var seenIndices = new Set();
    while (result.length < count) {
        var randomIndex = Math.floor(Math.random() * arr.length);
        if (!seenIndices.has(randomIndex)) {
            seenIndices.add(randomIndex);
            result.push(arr[randomIndex]);
        }
    }
    return result;
}
// function getRandomElements(arr: any[], count: number): any[] {
//     /// Create a copy to avoid modifying the original array
//     const shuffled = [...arr];
//     // Fisher-Yates shuffle algorithm
//     for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1)); // Generate random index
//         // Swap elements
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//     }
//     // Return the first count elements
//     return shuffled.slice(0, count);
// }
function getBalance(rpc, pubkey) {
    return __awaiter(this, void 0, void 0, function () {
        var lamports_1, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, rpc.getBalance(pubkey).send()];
                case 1:
                    lamports_1 = (_a.sent()).value;
                    return [2 /*return*/, Number(lamports_1) / Number(LAMPORTS_PER_SOL)];
                case 2:
                    e_2 = _a.sent();
                    console.log(e_2);
                    return [2 /*return*/, -1];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function initializeSignerBalance(rpc, rpcSubscriptions, payer, keypairSignerList) {
    return __awaiter(this, void 0, void 0, function () {
        var balancePromises;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    balancePromises = keypairSignerList.map(function (signer) { return __awaiter(_this, void 0, void 0, function () {
                        var balance, amount;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getBalance(rpc, signer.address)];
                                case 1:
                                    balance = _a.sent();
                                    if (!(balance < 10)) return [3 /*break*/, 3];
                                    amount = BigInt(Math.floor((50 - balance) * Number(LAMPORTS_PER_SOL)));
                                    return [4 /*yield*/, _transfer(rpc, rpcSubscriptions, payer, signer, amount)];
                                case 2:
                                    _a.sent();
                                    console.log("".concat(signer.address, " balance is insufficient, recharged ").concat(50 - balance, " SOL, current balance: 50.0 SOL"));
                                    return [3 /*break*/, 4];
                                case 3:
                                    console.log("".concat(signer.address, " has sufficient balance"));
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(balancePromises)];
                case 1:
                    _a.sent(); // Execute all balance queries and transfers in parallel
                    return [2 /*return*/];
            }
        });
    });
}
// Iterate over keypairSignerArray and convert elements to keypairSignerList
function initializeKeypairSigners(keypairSignerArray, keypairSignerList) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, keypairSignerArray_1, bytes, signer, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, keypairSignerArray_1 = keypairSignerArray;
                    _a.label = 1;
                case 1:
                    if (!(_i < keypairSignerArray_1.length)) return [3 /*break*/, 6];
                    bytes = keypairSignerArray_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, web3_js_1.createKeyPairSignerFromBytes)(bytes)];
                case 3:
                    signer = _a.sent();
                    keypairSignerList.push(signer);
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    console.error("Failed to create signer:", error_5);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function executeGetBlockHeight(rpc) {
    return __awaiter(this, void 0, void 0, function () {
        var blowPromises, a, blockHeightPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blowPromises = [];
                    a = true;
                    _a.label = 1;
                case 1:
                    if (!a) return [3 /*break*/, 4];
                    blockHeightPromise = getBlockHeight(rpc);
                    blowPromises.push(blockHeightPromise); // Add promise to the array
                    if (!(blowPromises.length >= 500)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all(blowPromises)];
                case 2:
                    _a.sent(); // Execute all transfers in parallel
                    blowPromises.length = 0; // Clear the array
                    console.log("+500");
                    _a.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function executeGetBlockHeight2(rpc_url) {
    return __awaiter(this, void 0, void 0, function () {
        var blowPromises, a, blockHeightPromise, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blowPromises = [];
                    a = true;
                    _a.label = 1;
                case 1:
                    if (!a) return [3 /*break*/, 7];
                    blockHeightPromise = getBlockHeight2(rpc_url);
                    blowPromises.push(blockHeightPromise); // Add promise to the array
                    if (!(blowPromises.length >= 500)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, Promise.all(blowPromises)];
                case 3:
                    _a.sent(); // Execute all transfers in parallel
                    return [3 /*break*/, 5];
                case 4:
                    e_3 = _a.sent();
                    console.log(e_3);
                    return [3 /*break*/, 5];
                case 5:
                    blowPromises.length = 0; // Clear the array 
                    console.log("+500");
                    _a.label = 6;
                case 6: return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Execute 1000 transfers
function executeTransfers(rpc, rpcSubscriptions, amount, keypairSignerList) {
    return __awaiter(this, void 0, void 0, function () {
        var transferPromises, a, users, transferPromise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    transferPromises = [];
                    a = true;
                    _a.label = 1;
                case 1:
                    if (!a) return [3 /*break*/, 4];
                    users = getRandomElements(keypairSignerList, 2);
                    if (users == null) {
                        return [3 /*break*/, 1];
                    }
                    transferPromise = _transfer(rpc, rpcSubscriptions, users[0], users[1], amount);
                    transferPromises.push(transferPromise); // Add promise to the array
                    if (!(transferPromises.length >= 500)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all(transferPromises)];
                case 2:
                    _a.sent(); // Execute all transfers in parallel
                    transferPromises.length = 0; // Clear the array
                    _a.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var logBlowPath; // Declare global variable
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, configPath, config, directoryPath, httpProvider, wssProvider, payerArray, logPath, keypairSignerArray, keypairSignerList, cachedBlockhash, blockhashTimestamp, rpc, rpcSubscriptions, payer, timestamp, newLogPath, amount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = process.argv.slice(2);
                    configPath = args[0] || 'config_default.json';
                    if (!configPath) {
                        console.error("Please provide the configuration file path as a command line argument. For example:  ts-node blow.ts config.json");
                        process.exit(1);
                    }
                    config = loadConfig(configPath);
                    directoryPath = config.directoryPath;
                    httpProvider = config.httpProvider;
                    wssProvider = config.wssProvider;
                    payerArray = new Uint8Array(config.payerArray);
                    logPath = config.logPath;
                    keypairSignerArray = [];
                    keypairSignerList = [];
                    cachedBlockhash = null;
                    blockhashTimestamp = 0;
                    rpc = (0, web3_js_1.createSolanaRpc)(httpProvider);
                    console.log(httpProvider);
                    // Check if RPC creation was successful
                    if (!rpc) {
                        console.error("Failed to create RPC connection.");
                        process.exit(1); // Exit the program
                    }
                    else {
                        console.log("RPC connection created successfully.");
                    }
                    rpcSubscriptions = (0, web3_js_1.createSolanaRpcSubscriptions)(wssProvider);
                    // Check if RPC subscriptions creation was successful
                    if (!rpcSubscriptions) {
                        console.error("Failed to create RPC subscriptions.");
                        process.exit(1); // Exit the program
                    }
                    else {
                        console.log("RPC subscriptions created successfully.");
                    }
                    return [4 /*yield*/, (0, web3_js_1.createKeyPairSignerFromBytes)(payerArray)];
                case 1:
                    payer = _a.sent();
                    logBlowPath = path.join(logPath, 'blow.log');
                    fs.mkdirSync(path.dirname(logBlowPath), { recursive: true });
                    // Check if the file exists, if it does, rename it
                    if (fs.existsSync(logBlowPath)) {
                        timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        newLogPath = path.join(logPath, "blow_".concat(timestamp, ".log"));
                        fs.renameSync(logBlowPath, newLogPath); // Rename file
                    }
                    return [4 /*yield*/, initializeKeypairSignerArray(directoryPath, keypairSignerArray)];
                case 2:
                    _a.sent();
                    console.log("Directory reading completed, read ".concat(keypairSignerArray.length, " key pairs"));
                    return [4 /*yield*/, initializeKeypairSigners(keypairSignerArray, keypairSignerList)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, initializeSignerBalance(rpc, rpcSubscriptions, payer, keypairSignerList)];
                case 4:
                    _a.sent();
                    console.log("All signer balances initialized");
                    // Ensure there are enough elements in keypairSignerList
                    if (keypairSignerList.length < 2) {
                        console.error("Insufficient elements in keypairSignerList, unable to execute the transfer");
                        return [2 /*return*/];
                    }
                    console.log("Running ... ...");
                    amount = BigInt(1000);
                    return [4 /*yield*/, executeTransfers(rpc, rpcSubscriptions, amount, keypairSignerList)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
