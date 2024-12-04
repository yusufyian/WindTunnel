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


async function analyzeTransactions(lines: string[]): Promise<Map<string, number>> {
    const transactionCount = new Map<string, number>();

    for (const line of lines) {
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
    const logFilePath = '/home/ubuntu/workspace/WindTunnel/logs/blow.log';
    const transactionCount = new Map<string, number>();

    // 读取初始文件内容
    const initialLines = fs.readFileSync(logFilePath, 'utf-8').split('\n');
    const initialResult = await analyzeTransactions(initialLines);
    for (const [minute, count] of Array.from(initialResult.entries()).sort()) {
        transactionCount.set(minute, count);
        console.log(`${minute}: ${count} Transactions`);
    }

    // 监控文件变化
    fs.watch(logFilePath, async (eventType) => {
        if (eventType === 'change') {
            const newLines = fs.readFileSync(logFilePath, 'utf-8').split('\n');
            const newTransactions = await analyzeTransactions(newLines);
            for (const [minute, count] of Array.from(newTransactions.entries())) {
                transactionCount.set(minute, (transactionCount.get(minute) || 0) + count);
                console.log(`${minute}: ${transactionCount.get(minute)} Transactions`);
            }
        }
    });
}

main().catch(console.error);