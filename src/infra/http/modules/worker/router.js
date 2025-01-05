const {Router} = require("express");
const {fork} = require('child_process');
const {join} = require('path');
module.exports = ({prisma, workerManager}) => {

    const router = Router();
    const processMap = new Map();

    let exitFlag = true;

    process.on('SIGINT', () => {
        if (!exitFlag) {
            console.log("Received SIGINT. Ignoring exit and keeping child processes running.");
            return;
        }
        console.log("Exiting application...");
        process.exit();
    });
    process.on('exit', () => {
        if (!exitFlag) {
            console.log("Process is exiting. Ignoring child process termination.");
        }
    });


    /**
     * @swagger
     *   /worker/{id}/stop:
     *     get:
     *       tags:
     *         - Клиенты
     *       summary: Остановить клиента
     *       description: Останавливает запущенный процесс клиента с указанным `id`.
     *       parameters:
     *         - name: id
     *           in: path
     *           required: true
     *           description: Идентификатор клиента, который необходимо остановить.
     *           schema:
     *             type: integer
     *             example: 1
     *       responses:
     *         '200':
     *           description: Клиент успешно остановлен.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "Client 1 stopped successfully."
     *         '404':
     *           description: Клиент с указанным ID не найден.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "No running client found with ID 1"
     *         '500':
     *           description: Ошибка при остановке клиента.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "Failed to stop client 1"
     *                   error:
     *                     type: string
     *                     example: "Error message"
     */
    router.get('/:id/stop', async (req, res) => {
        const {id} = req.params;

        const childProcess = processMap.get((id));
        if (!childProcess) {
            return res.status(404).send({message: `No running client found with ID ${id}`});
        }

        try {
            childProcess.kill();
            processMap.delete(Number(id)); // Удаляем процесс из карты
            console.log(`Client ${id} stopped successfully.`);
            res.send({message: `Client ${id} stopped successfully.`});
        } catch (error) {
            console.error(`Failed to stop client ${id}:`, error);
            res.status(500).send({message: `Failed to stop client ${id}`, error: error.message});
        }
    });


    /**
     * @swagger
     *  /worker/{id}/start:
     *     get:
     *       tags:
     *         - Клиенты
     *       summary: Запустить клиента
     *       description: Запускает процесс клиента с указанным `id`.
     *       parameters:
     *         - name: id
     *           in: path
     *           required: true
     *           description: Идентификатор клиента, который необходимо запустить.
     *           schema:
     *             type: integer
     *             example: 1
     *       responses:
     *         '200':
     *           description: Клиент успешннормсао запущен. Возвращает данные клиента.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: Идентификатор клиента.
     *                     example: 1
     *                   gaea_token:
     *                     type: string
     *                     description: Токен клиента для Gaea.
     *                     example: "gaea12345"
     *                   browser_id:
     *                     type: string
     *                     description: Идентификатор браузера клиента.
     *                     example: "browser123"
     *                   proxies:
     *                     type: array
     *                     items:
     *                       type: string
     *                     description: Список прокси, назначенных клиенту.
     *                     example: ["http://proxy1", "http://proxy2"]
     *                   browserIdFilePath:
     *                     type: string
     *                     description: Путь к файлу идентификаторов браузера.
     *                     example: "/path/to/uploads/browser123-browser_ids.json"
     *         '404':
     *           description: Клиент с указанным ID не найден.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "No clients found with the given ID"
     *         '500':
     *           description: Ошибка при запуске клиента.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "Failed to start client"
     *                   error:
     *                     type: string
     *                     example: "Error message"
     */
    router.get('/:id/start', async (req, res) => {
        const {id} = req.params;

        const client = await prisma.proxyWorker.findUnique({
            where: {
                id: id
            },
            include: {
                ClientsToProxies: {
                    include: {
                        proxy: true,
                    },
                },
            },
        });

        if (!client) {
            return res.status(404).send({message: 'No clients found with the given ID'});
        }

        const clientData = {
            id: client.id,
            gaea_token: client.gaea_token,
            browser_id: client.browser_id,
            proxies: client.ClientsToProxies.map((ctp) => `http://${ctp.proxy.id}`),
            browserIdFilePath: join(__dirname, '..', '..', '..', '..', '..', 'uploads', `${client.browser_id}-browser_ids.json`),
        }

        res.send(clientData);

        const child = fork('./child.js', [JSON.stringify(clientData)]);

        processMap.set(clientData.id, child);

        child.on('message', (message) => {
            console.log(`Child ${clientData.id} Message: ${message}`);
        });

        child.on('error', (error) => {
            console.error(`Child ${clientData.id} Error: ${error.message}`);
        });

        child.on('exit', (code) => {
            console.log(`Child ${clientData.id} exited with code ${code}`);
            processMap.delete(clientData.id);
        });
    });


    /**
     * @swagger
     *  /worker/start-all:
     *     get:
     *       tags:
     *         - Клиенты
     *       summary: Запустить всех клиентов
     *       description: Запускает процесс для всех клиентов.
     *       responses:
     *         '200':
     *           description: Все клиенты успешно запущены. Возвращает список данных клиентов.
     *           content:
     *             application/json:
     *               schema:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: integer
     *                       description: Идентификатор клиента.
     *                       example: 1
     *                     gaea_token:
     *                       type: string
     *                       description: Токен клиента для Gaea.
     *                       example: "gaea12345"
     *                     browser_id:
     *                       type: string
     *                       description: Идентификатор браузера клиента.
     *                       example: "browser123"
     *                     proxies:
     *                       type: array
     *                       items:
     *                         type: string
     *                       description: Список прокси, назначенных клиенту.
     *                       example: ["http://proxy1", "http://proxy2"]
     *                     browserIdFilePath:
     *                       type: string
     *                       description: Путь к файлу идентификаторов браузера.
     *                       example: "/path/to/uploads/browser123-browser_ids.json"
     *         '500':
     *           description: Ошибка при запуске клиентов.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "Failed to start all clients"
     *                   error:
     *                     type: string
     *                     example: "Error message"
     */
    router.get('/start-all', async (req, res) => {
        try {
            const clients = await prisma.proxyWorker.findMany({
                include: {
                    ClientsToProxies: {
                        include: {
                            proxy: true,
                        },
                    },
                },
            });

            if (!clients.length) {
                return res.status(404).send({message: 'No clients found'});
            }

            const clientsData = clients.map((client) => ({
                id: client.id,
                gaea_token: client.gaea_token,
                browser_id: client.browser_id,
                proxies: client.ClientsToProxies.map((ctp) => `http://${ctp.proxy.id}`),
                browserIdFilePath: join(__dirname, '..', '..', '..', '..', '..', 'uploads', `${client.browser_id}-browser_ids.json`),
            })).filter(el => el.proxies.length > 0);

            clientsData.forEach((clientData) => {
                const child = fork('./child.js', [JSON.stringify(clientData)]);

                processMap.set(clientData.id, child);

                child.on('message', (message) => {
                    console.log(`Child ${clientData.id} Message: ${message}`);
                });

                child.on('error', (error) => {
                    console.error(`Child ${clientData.id} Error: ${error.message}`);
                });

                child.on('exit', (code) => {
                    console.log(`Child ${clientData.id} exited with code ${code}`);
                    processMap.delete(clientData.id);
                });
            });

            res.send(clientsData);
        } catch (error) {
            console.error('Failed to start all clients:', error);
            res.status(500).send({message: 'Failed to start all clients', error: error.message});
        }
    });


    /**
     * @swagger
     *   /worker/stop-all:
     *     get:
     *       tags:
     *         - Клиенты
     *       summary: Остановить всех клиентов
     *       description: Останавливает все запущенные процессы клиентов.
     *       responses:
     *         '200':
     *           description: Все клиенты успешно остановлены.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "All clients stopped successfully."
     *         '500':
     *           description: Ошибка при остановке клиентов.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     example: "Failed to stop all clients"
     *                   error:
     *                     type: string
     *                     example: "Error message"
     */
    router.get('/stop-all', async (req, res) => {
        try {
            if (processMap.size === 0) {
                return res.status(404).send({message: 'No running clients found'});
            }
            processMap.forEach((childProcess, id) => {
                try {
                    childProcess.kill();
                    console.log(`Client ${id} stopped successfully.`);
                    processMap.delete(id);
                } catch (error) {
                    console.error(`Failed to stop client ${id}:`, error);
                }
            });

            res.send({message: 'All clients stopped successfully.'});
        } catch (error) {
            console.error('Failed to stop all clients:', error);
            res.status(500).send({message: 'Failed to stop all clients', error: error.message});
        }
    });


    return router;
};