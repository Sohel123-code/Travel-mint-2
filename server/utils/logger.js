/**
 * logger.js — simple timestamped console logger
 */
const colors = {
    reset: '\x1b[0m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    gray: '\x1b[90m',
};

function timestamp() {
    return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const logger = {
    info: (msg, data) => console.log(`${colors.cyan}[${timestamp()}] INFO${colors.reset}  ${msg}`, data !== undefined ? data : ''),
    ok: (msg, data) => console.log(`${colors.green}[${timestamp()}] OK${colors.reset}    ${msg}`, data !== undefined ? data : ''),
    warn: (msg, data) => console.log(`${colors.yellow}[${timestamp()}] WARN${colors.reset}  ${msg}`, data !== undefined ? data : ''),
    error: (msg, data) => console.error(`${colors.red}[${timestamp()}] ERROR${colors.reset} ${msg}`, data !== undefined ? data : ''),
    dim: (msg, data) => console.log(`${colors.gray}[${timestamp()}] DEBUG${colors.reset} ${msg}`, data !== undefined ? data : ''),
};

module.exports = logger;
