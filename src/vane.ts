import * as fs from 'fs';
import * as readline from 'readline';
import { exec } from 'child_process';

function checkRunningProcesses() {
    exec('ps aux | grep -E "node blow.js|ts-node blow.ts"', (error, stdout, stderr) => {
        if (error) {
            console.error(`执行错误: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`错误输出: ${stderr}`);
            return;
        }
        if (stdout) {
            console.log("正在运行的进程：");
            console.log(stdout);
        } else {
            console.log("没有正在运行的 node blow.js 或 ts-node blow.ts 进程。");
        }
    });
}


async function analyzeTransactions(logFile: string): Promise<Map<string, number>> {
    const transactionCount = new Map<string, number>();

    const fileStream = fs.createReadStream(logFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        // 假设日志行格式为 "时间 Transaction ..."
        const match = line.match(/\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\] Transaction\.transfer: .*/);
        if (match) {
            const timestamp = match[1];
            const minute = timestamp.substring(0, 16); // 获取到分钟
            transactionCount.set(minute, (transactionCount.get(minute) || 0) + 1);
        }
    }

    return transactionCount;
}

async function main() {
    // checkRunningProcesses();
    const logFilePath = '/home/ubuntu/workspace/WindTunnel/logs/blow.log';
    const result = await analyzeTransactions(logFilePath);
    for (const [minute, count] of Array.from(result.entries()).sort()) {
        console.log(`${minute}: ${count} Transactions`);
    }
}

main().catch(console.error);