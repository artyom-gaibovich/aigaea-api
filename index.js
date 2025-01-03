const {body, validationResult} = require('express-validator');
const express = require('express');
const ProxyTaskManager = require("./adapters/ProxyWorker");
const AIGAEAClient = require("./adapters/aigaea.client");
const HttpSender = require("./adapters/http-sender");
const BrowserIdsManager = require("./adapters/browser-ids/browser-ids-manager");
const BrowserIdsFileManager = require("./adapters/browser-ids/browser-ids-file-manager");
const ProxyReader = require("./adapters/proxy-reader");
const {PrismaClient} = require('@prisma/client');

const {join} = require("node:path");
const ClientProxy = require("./adapters/task/ClientProxy");
const app = express();
app.use(express.json({limit: '10mb'}));
const port = process.env.PORT || 3000;

const router = express.Router();
app.use(express.text());

app.use(express.raw({type: 'application/octet-stream', limit: '1mb'}));

const clients = [];
const proxyTaskManager = new ProxyTaskManager(new AIGAEAClient(new HttpSender(), new BrowserIdsManager(new BrowserIdsFileManager())))
const prisma = new PrismaClient();


app.use(router)
router.post(
    '/upload',
    [
        body('proxy_list')
            .isString()
            .withMessage('proxy_list must be a string')
            .notEmpty()
            .withMessage('browser_id is required'),
        body('gaea_token')
            .isString()
            .withMessage('gaea_token must be a string')
            .notEmpty()
            .withMessage('gaea_token is required'),
        body('browser_id')
            .isString()
            .withMessage('browser_id must be a string')
            .notEmpty()
            .withMessage('browser_id is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        const {gaea_token, browser_id, proxy_list} = req.body;
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        res.send('OK')

        /*        proxyTaskManager.run(
                    {
                        proxies: new ProxyReader().readNew(proxy_list),
                        id8: browser_id,
                        headers: {
                            'Accept': 'application/json, text/plain, *!/!*',
                            'origin': 'chrome-extension://cpjicfogbgognnifjgmenmaldnmeeeib',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${gaea_token}`,
                            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
                        },
                        browserIdFilePath: join(__dirname, 'uploads', `${browser_id}-browser_ids.json`)
                    }
                )*/

    }
);


app.post('/process-proxies', (req, res) => {
    const text = req.body;

    if (!text) {
        return res.status(400).json({error: 'Text is required'});
    }

    const proxies = text.split('\n').map(el => `http://${el}`);

    res.json({proxy_list: proxies.join('\n')});
});
app.use('/api', router);
app.get('/start/:id', async (req, res) => {
    const {id} = Number(req.params);
    const clients = await prisma.proxyWorker.findMany(
        {
            where: {
                instance: id,
                proxy_list: {
                    not: null
                }
            }
        }
    );
    const clientsNew = clients.map((client) => new ClientProxy(
        {
            id: client.id,
            gaea_token: client.gaea_token,
            browser_id: client.browser_id,
            proxies: new ProxyReader().readNew(client.proxy_list),
            browserIdFilePath: join(__dirname, 'uploads', `${client.browser_id}-browser_ids.json`),
            proxyWorker: proxyTaskManager,
        }
    ))
    for (const client of clientsNew) {
        await new Promise((resolve, reject) => setTimeout(resolve, 60000));
        client.run()
    }
    res.send(clientsNew);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
