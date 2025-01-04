const {body, validationResult} = require('express-validator');
const express = require('express');
const ProxyTaskManager = require("./adapters/ProxyWorker");
const AIGAEAClient = require("./adapters/aigaea.client");
const HttpSender = require("./adapters/http-sender");
const BrowserIdsManager = require("./adapters/browser-ids/browser-ids-manager");
const BrowserIdsFileManager = require("./adapters/browser-ids/browser-ids-file-manager");
const ProxyReader = require("./adapters/proxy-reader");
const {PrismaClient} = require('@prisma/client');
const {fork} = require('child_process');
const {join} = require("node:path");
const ClientProxy = require("./adapters/task/ClientProxy");
const app = express();
app.use(express.json({limit: '10mb'}));
const port = process.env.PORT || 3000;

const router = express.Router();
app.use(express.text({limit: '10mb'}));

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
    const {id} = req.params;
    const clients = await prisma.proxyWorker.findMany(
        {
            where: {
                instance: {
                    equals: Number(id)
                },
                proxy_list: {
                    not: null
                }
            },
        }
    );
    const clientsData = clients.map((client) => ({
        id: client.id,
        gaea_token: client.gaea_token,
        browser_id: client.browser_id,
        proxies: new ProxyReader().readNew(client.proxy_list, 10),
        browserIdFilePath: join(__dirname, 'uploads', `${client.browser_id}-browser_ids.json`),
    }));

    res.send(clientsData);

    /*for (const clientData of clientsData) {
        const child = fork('./child.js', [JSON.stringify(clientData)]);

        child.on('message', (message) => {
            console.log(`Child Message: ${message}`);
        });

        child.on('error', (error) => {
            console.error(`Child Error: ${error.message}`);
        });

        child.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
        });
    }*/


    /* res.send(clientsNew);
     for (const client of clientsNew) {
         client.run()
         await new Promise((resolve, reject) => setTimeout(resolve, 60000));
     }*/
});

app.post('/proxies/upload', (req, res) => {
    const text = req.body;

    if (!text) {
        return res.status(400).json({error: 'Text is required'});
    }

    const proxies = text.split('\n').map(el => el);
    proxies.forEach((proxy) => {
        prisma.proxy.create({
            data: {
                id: proxy
            }
        }).then(() => {
        }).catch((err) => console.log(err));
    })

    res.json({proxy_list: proxies.join('\n')});
});


app.post('/assign-proxies/:id', async (req, res) => {
    const clientId = req.params.id;

    try {
        const result = await prisma.$transaction(async (tx) => {
            const client = await tx.proxyWorker.findUnique({
                where: {id: clientId},
            });

            if (!client) {
                throw new Error('Client not found');
            }

            const {proxy_count} = client;

            if (!proxy_count || proxy_count <= 0) {
                throw new Error('Invalid proxy count for client');
            }
            const availableProxies = await tx.proxy.findMany({
                where: {
                    ClientsToProxies: {none: {}},
                },
                take: proxy_count,
            });
            if (availableProxies.length < proxy_count) {
                throw new Error('Not enough available proxies in the database');
            }
            const createLinks = availableProxies.map((proxy) =>
                tx.clientsToProxies.create({
                    data: {
                        client_id: clientId,
                        proxy_id: proxy.id,
                    },
                })
            );
            await Promise.all(createLinks);
            return {
                message: 'Proxies assigned successfully',
                assignedProxies: availableProxies.map((proxy) => proxy.id),
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error assigning proxies:', error.message);
        res.status(500).json({error: error.message || 'Internal server error'});
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

