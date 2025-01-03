const ProxyTaskManager = require("./adapters/proxy-task-manager");
const AIGAEAClient = require("./adapters/aigaea.client");
const BrowserIdsManager = require("./adapters/browser-ids/browser-ids-manager");
const BrowserIdsFileManager = require("./adapters/browser-ids/browser-ids-file-manager");
const HttpSender = require("./adapters/http-sender");
const {join} = require("node:path");
const ProxyReader = require("./adapters/proxy-reader");


const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiIxMDcyNzYzMzk5NzQ1MCIsInVzZXJuYW1lIjoiRGl2b3Rlc3Q0LSIsInNlY3JldCI6IjA0NDcwM2ZkIiwiZXhwaXJlIjoxNzM2NDY3OTE0fQ.TQ5FlepMdAA2wDPhDCc1wY1hrw9cxHnewgtsYoYIVIo'

const proxyTaskManager = new ProxyTaskManager(new AIGAEAClient(new HttpSender(), new BrowserIdsManager(new BrowserIdsFileManager()))).run(
    {
        proxies: new ProxyReader().read('proxy.txt'),
        id8: '4c8272ad',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'origin': 'chrome-extension://cpjicfogbgognnifjgmenmaldnmeeeib',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
        },
        browserIdFilePath: join(__dirname, 'browser_ids.json')
    }
);

