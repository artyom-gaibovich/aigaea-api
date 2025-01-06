const {Router} = require("express");
const {fork} = require('child_process');
const {join} = require('path');
const ProxyClientEntity = require("../../../../domain/entities/proxy-client");

module.exports = ({prisma, workerManager, repository, middlewares}) => {

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
    router.get('/:id/stop', middlewares.checkBillingMiddleware.checkBilling, (req, res) => {
        const {id} = req.params;
        try {
            const message = workerManager.stopById(id);
            console.log(message);
            res.send({message});
        } catch (error) {
            console.error(error.message);
            if (error.message.includes('Нет запущенного клиента с')) {
                return res.status(404).send({message: error.message});
            }
            res.status(500).send({message: error.message, error: error.stack});
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
    router.get('/:id/start', middlewares.checkBillingMiddleware.checkBilling, async (req, res) => {
        const {id} = req.params;
        const client = await repository.proxyClientRepository.findByIdWithProxies(id)
        if (!client) {
            return res.status(404).send({message: 'В бд не найден клиент с ID'});
        }
        await workerManager.start(client)
        res.send(client);
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
            const clients = await repository.proxyClientRepository.findAllWithProxies()
            if (!clients.length) {
                return res.status(404).send({message: 'No clients found'});
            }
            await workerManager.startAll(clients)
            res.send(clients);
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
    router.get('/stop-all', middlewares.checkBillingMiddleware.checkBilling, async (req, res) => {
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