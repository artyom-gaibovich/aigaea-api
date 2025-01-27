const {Router} = require("express");
const express = require("express");


module.exports = ({prisma}) => {


    const router = Router()

    /**
     * @swagger
     * paths:
     *   /proxies:
     *     post:
     *       tags:
     *         - Proxies
     *       summary: Загрузка прокси
     *       description: Принимает список прокси в формате простого текста (по одному прокси на строку) и сохраняет их в базе данных.
     *       requestBody:
     *         required: true
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 text:
     *                   type: string
     *                   description: Строка простого текста, содержащая прокси, разделенные новой строкой.
     *                   example: "proxy1\nproxy2\nproxy3"
     *               required:
     *                 - text
     *       responses:
     *         '200':
     *           description: Прокси успешно загружены и возвращены как единая строка.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   proxy_list:
     *                     type: string
     *                     description: Строка простого текста, содержащая прокси, разделенные новой строкой.
     *                     example: "proxy1\nproxy2\nproxy3"
     *         '400':
     *           description: Неверный ввод; требуется поле "text".
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Сообщение об ошибке.
     *                     example: "Текст обязателен"
     */
    router.post("/", (req, res) => {
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
    })


    /**
     * @swagger
     * /proxies/{userId}:
     *     post:
     *       tags:
     *         - Proxies
     *       summary: Назначить прокси пользователю
     *       description: Извлекает доступные прокси из базы данных и назначает их пользователю в зависимости от их количества.
     *       parameters:
     *         - name: userId
     *           in: path
     *           required: true
     *           description: Идентификатор пользователя (клиента), которому следует назначить прокси.
     *           schema:
     *             type: string
     *             example: "12345"
     *       responses:
     *         '200':
     *           description: Прокси успешно назначены пользователю.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     description: Сообщение об успехе.
     *                     example: "Прокси успешно назначены"
     *                   assignedProxies:
     *                     type: array
     *                     items:
     *                       type: string
     *                     description: Список идентификаторов назначенных прокси.
     *                     example: ["proxy1", "proxy2", "proxy3"]
     *         '400':
     *           description: Неверный идентификатор пользователя или недостаточно прокси для пользователя.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Сообщение об ошибке.
     *                     example: "Клиент не найден"
     *         '500':
     *           description: Ошибка сервера или сбой транзакции базы данных.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Сообщение об ошибке.
     *                     example: "Недостаточно доступных прокси в базе данных"
     */
    router.post('/:id', async (req, res) => {
        const clientId = req.params.id;
        try {
            const result = await prisma.$transaction(async (tx) => {
                const client = await tx.proxyClient.findUnique({
                    where: {id: clientId},
                });
                if (!client) {
                    throw new Error('Клиент не найден');
                }
                const {proxy_count} = client;

                if (!proxy_count || proxy_count <= 0) {
                    throw new Error('Неверное или нулевое колисчество проксей для клиента');
                }

                const assignedProxiesCount = await tx.clientsToProxies.count({
                    where: {client_id: clientId},
                });

                const remainingProxies = proxy_count - assignedProxiesCount;

                if (remainingProxies <= 0) {
                    throw new Error('Клиенту уже назначено необходимое кол-во проксей');
                }

                const availableProxies = await tx.proxy.findMany({
                    where: {
                        ClientsToProxies: {
                            none: {
                                client_id: clientId,
                            }
                        },
                    },
                    take: remainingProxies,
                });

                if (availableProxies.length < remainingProxies) {
                    throw new Error('Недостаточное кол-во проксей в БД');
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
                    message: 'Прокси назначены успешно',
                    assignedProxies: availableProxies.map((proxy) => proxy.id),
                };
            }, {timeout: 60000});

            res.status(200).json(result);
        } catch (error) {
            console.error('Ошибка с назначением проксей:', error.message);
            res.status(500).json({error: error.message || 'Ошибка сервера или сбой транзакции базы данных'});
        }
    });


    /**
     * @swagger
     *  /proxies/{userId}:
     *     delete:
     *       tags:
     *         - Proxies
     *       summary: Удалить все прокси, назначенные пользователю
     *       description: Удаляет все прокси, связанные с указанным пользователем (клиентом).
     *       parameters:
     *         - name: userId
     *           in: path
     *           required: true
     *           description: Идентификатор пользователя (клиента), для которого следует удалить прокси.
     *           schema:
     *             type: string
     *             example: "12345"
     *       responses:
     *         '200':
     *           description: Прокси успешно удалены у пользователя.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     description: Сообщение об успехе.
     *                     example: "Все прокси успешно удалены"
     *                   removedCount:
     *                     type: integer
     *                     description: Количество удаленных прокси.
     *                     example: 5
     *         '400':
     *           description: Неверный идентификатор пользователя или прокси не найдены для пользователя.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Сообщение об ошибке.
     *                     example: "Клиент не найден"
     *         '500':
     *           description: Ошибка сервера или сбой транзакции базы данных.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Сообщение об ошибке.
     *                     example: "Внутренняя ошибка сервера"
     */
    router.delete('/:id', async (req, res) => {
        const clientId = req.params.id;

        try {
            const result = await prisma.$transaction(async (tx) => {
                const client = await tx.proxyClient.findUnique({
                    where: {id: clientId},
                });

                if (!client) {
                    throw new Error('Client not found');
                }

                const deletedLinks = await tx.clientsToProxies.deleteMany({
                    where: {
                        client_id: clientId,
                    },
                });

                if (deletedLinks.count === 0) {
                    throw new Error('No proxies found for the client');
                }

                return {
                    message: 'All proxies removed successfully',
                    removedCount: deletedLinks.count,
                };
            }, {timeout: 60000});

            res.status(200).json(result);
        } catch (error) {
            console.error('Error removing proxies:', error.message);
            res.status(500).json({error: error.message || 'Internal server error'});
        }
    });

    return router;

}

