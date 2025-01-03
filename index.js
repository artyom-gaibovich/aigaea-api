const {body, validationResult} = require('express-validator');
const express = require('express');
const Bot = require("./bot");
const ProxyTaskManager = require("./adapters/proxy-task-manager");
const AIGAEAClient = require("./adapters/aigaea.client");
const HttpSender = require("./adapters/http-sender");
const BrowserIdsManager = require("./adapters/browser-ids/browser-ids-manager");
const BrowserIdsFileManager = require("./adapters/browser-ids/browser-ids-file-manager");
const ProxyReader = require("./adapters/proxy-reader");
const {join} = require("node:path");
const app = express();
app.use(express.json({limit: '10mb'}));
const port = process.env.PORT || 3000;

const router = express.Router();
app.use(express.text());

app.use(express.raw({type: 'application/octet-stream', limit: '1mb'}));

const bots = [];
const proxyTaskManager = new ProxyTaskManager(new AIGAEAClient(new HttpSender(), new BrowserIdsManager(new BrowserIdsFileManager())))
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

        proxyTaskManager.run(
            {
                proxies: new ProxyReader().readNew(proxy_list),
                id8: browser_id,
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'origin': 'chrome-extension://cpjicfogbgognnifjgmenmaldnmeeeib',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${gaea_token}`,
                    'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
                },
                browserIdFilePath: join(__dirname, 'uploads', `${browser_id}-browser_ids.json`)
            }
        )

        res.send({message: 'Fields validated successfully!'});
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
app.get('/', (req, res) => {
    console.log('hi');
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
