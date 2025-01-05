const {Router} = require("express");


module.exports = ({prisma}) => {


    const router = Router()


    /**
     * @swagger
     * paths:
     *   /proxies:
     *     post:
     *       tags:
     *         - Proxies
     *       summary: Upload proxies
     *       description: Accepts a list of proxies in plain text format (one proxy per line) and stores them in the database.
     *       requestBody:
     *         required: true
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 text:
     *                   type: string
     *                   description: A plain text string containing proxies separated by new lines.
     *                   example: "proxy1\nproxy2\nproxy3"
     *               required:
     *                 - text
     *       responses:
     *         '200':
     *           description: Proxies successfully uploaded and returned as a single string.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   proxy_list:
     *                     type: string
     *                     description: A plain text string containing proxies, separated by new lines.
     *                     example: "proxy1\nproxy2\nproxy3"
     *         '400':
     *           description: Invalid input; "text" field is required.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Error message.
     *                     example: "Text is required"
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
     * paths:
     *   /proxies/{userId}:
     *     post:
     *       tags:
     *         - Proxies
     *       summary: Assign proxies to a user
     *       description: Fetches available proxies from the database and assigns them to a user based on their proxy count.
     *       parameters:
     *         - name: userId
     *           in: path
     *           required: true
     *           description: The ID of the user (client) to whom the proxies should be assigned.
     *           schema:
     *             type: string
     *             example: "12345"
     *       responses:
     *         '200':
     *           description: Proxies successfully assigned to the user.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     description: Success message.
     *                     example: "Proxies assigned successfully"
     *                   assignedProxies:
     *                     type: array
     *                     items:
     *                       type: string
     *                     description: List of IDs of the assigned proxies.
     *                     example: ["proxy1", "proxy2", "proxy3"]
     *         '400':
     *           description: Invalid user ID or insufficient proxy count for the user.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Error message.
     *                     example: "Client not found"
     *         '500':
     *           description: Internal server error or database transaction failure.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Error message.
     *                     example: "Not enough available proxies in the database"
     */
    router.post('/:userId', async (req, res) => {
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
                        ClientsToProxies: {
                            none: {
                                client_id: clientId,
                            }
                        },
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
            }, {timeout: 60000});

            res.status(200).json(result);
        } catch (error) {
            console.error('Error assigning proxies:', error.message);
            res.status(500).json({error: error.message || 'Internal server error'});
        }
    });


    /**
     * paths:
     *   /proxies/{userId}:
     *     delete:
     *       tags:
     *         - Proxies
     *       summary: Remove all proxies assigned to a user
     *       description: Deletes all proxies linked to the specified user (client).
     *       parameters:
     *         - name: userId
     *           in: path
     *           required: true
     *           description: The ID of the user (client) whose proxies should be removed.
     *           schema:
     *             type: string
     *             example: "12345"
     *       responses:
     *         '200':
     *           description: Proxies successfully removed from the user.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   message:
     *                     type: string
     *                     description: Success message.
     *                     example: "All proxies removed successfully"
     *                   removedCount:
     *                     type: integer
     *                     description: The number of proxies removed.
     *                     example: 5
     *         '400':
     *           description: Invalid user ID or no proxies found for the user.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Error message.
     *                     example: "Client not found"
     *         '500':
     *           description: Internal server error or database transaction failure.
     *           content:
     *             application/json:
     *               schema:
     *                 type: object
     *                 properties:
     *                   error:
     *                     type: string
     *                     description: Error message.
     *                     example: "Internal server error"
     */
    router.delete('/:id', async (req, res) => {
        const clientId = req.params.userId;

        try {
            const result = await prisma.$transaction(async (tx) => {
                const client = await tx.proxyWorker.findUnique({
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

