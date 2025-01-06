const {router} = require("express/lib/application");
const {body, param, validationResult} = require("express-validator");
const {Router} = require("express");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    next();
};


module.exports = ({prisma}) => {

    const router = Router();

    /**
     * @swagger
     * /proxy-client/{id}:
     *   get:
     *     summary: Получить ProxyClient по ID
     *     tags: [ProxyClient]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: UUID ProxyClient
     *     responses:
     *       200:
     *         description: Данные ProxyClient
     *       404:
     *         description: ProxyClient не найден
     *       500:
     *         description: Ошибка на сервере
     */
    router.get(
        '/:id',
        [param('id').isUUID(), handleValidationErrors],
        async (req, res) => {
            try {
                const { id } = req.params;
                const proxyWorker = await prisma.proxyWorker.findUnique({
                    where: { id }
                });
                if (!proxyWorker) return res.status(404).json({ error: 'ProxyWorker not found' });
                res.json(proxyWorker);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to fetch ProxyWorker' });
            }
        }
    );

    /**
     * @swagger
     * /proxy-clients:
     *   get:
     *     summary: Список ProxyClients с возможными фильтрами и пагинацией
     *     tags: [ProxyClient]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Номер страницы для пагинации
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Количество элементов на странице
     *       - in: query
     *         name: state
     *         schema:
     *           type: boolean
     *         description: Фильтр по состоянию
     *       - in: query
     *         name: email
     *         schema:
     *           type: string
     *         description: Фильтр по email
     *       - in: query
     *         name: browser_id
     *         schema:
     *           type: string
     *         description: Фильтр по browser_id
     *     responses:
     *       200:
     *         description: Список ProxyClients
     *       500:
     *         description: Ошибка на сервере
     */
    router.get('/', async (req, res) => {
        try {
            const { page = 1, limit = 10, state, email, browser_id } = req.query;
            const filters = {};

            if (state !== undefined) filters.state = state === 'true';
            if (email) filters.email = email;
            if (browser_id) filters.browser_id = browser_id;

            const proxyWorkers = await prisma.proxyWorker.findMany({
                where: filters,
                skip: (page - 1) * limit,
                take: parseInt(limit, 10)
            });
            res.json(proxyWorkers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch ProxyWorkers' });
        }
    });

    /**
     * @swagger
     * /proxy-client:
     *   post:
     *     summary: Создать новый ProxyClient
     *     tags: [ProxyClient]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               state:
     *                 type: boolean
     *               browser_id:
     *                 type: string
     *                 maxLength: 256
     *               gaea_token:
     *                 type: string
     *                 maxLength: 512
     *               proxy_list:
     *                 type: string
     *               beget_password:
     *                 type: string
     *               aigaea_password:
     *                 type: string
     *               proxy_count:
     *                 type: integer
     *               email:
     *                 type: string
     *                 format: email
     *               expires:
     *                 type: string
     *                 format: date-time
     *               ref_link:
     *                 type: string
     *     responses:
     *       201:
     *         description: Успешно создано
     *       400:
     *         description: Ошибки валидации
     *       500:
     *         description: Ошибка на сервере
     */
    router.post(
        '/',
        [
            body('state').isBoolean(),
            body('browser_id').isString().isLength({ max: 256 }),
            body('gaea_token').isString().isLength({ max: 512 }),
            body('proxy_list').optional().isString(),
            body('beget_password').isString(),
            body('aigaea_password').isString(),
            body('proxy_count').isInt(),
            body('email').optional().isEmail(),
            body('expires').optional().isISO8601(),
            body('ref_link').optional().isString(),
            handleValidationErrors
        ],
        async (req, res) => {
            try {
                const data = req.body;
                const proxyWorker = await prisma.proxyWorker.create({
                    data
                });
                res.status(201).json(proxyWorker);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to create ProxyWorker' });
            }
        }
    );



    /**
     * @swagger
     * /proxy-client/{id}:
     *   put:
     *     summary: Обновить ProxyClient по ID
     *     tags: [ProxyClient]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: UUID ProxyClient
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               state:
     *                 type: boolean
     *               browser_id:
     *                 type: string
     *                 maxLength: 256
     *               gaea_token:
     *                 type: string
     *                 maxLength: 512
     *               proxy_list:
     *                 type: string
     *               beget_password:
     *                 type: string
     *               aigaea_password:
     *                 type: string
     *               proxy_count:
     *                 type: integer
     *               email:
     *                 type: string
     *                 format: email
     *               expires:
     *                 type: string
     *                 format: date-time
     *               ref_link:
     *                 type: string
     *     responses:
     *       200:
     *         description: Успешно обновлено
     *       400:
     *         description: Ошибки валидации
     *       500:
     *         description: Ошибка на сервере
     */
    router.put(
        '/:id',
        [
            param('id').isUUID(),
            body('state').optional().isBoolean(),
            body('browser_id').optional().isString().isLength({ max: 256 }),
            body('gaea_token').optional().isString().isLength({ max: 512 }),
            body('proxy_list').optional().isString(),
            body('beget_password').optional().isString(),
            body('aigaea_password').optional().isString(),
            body('proxy_count').optional().isInt(),
            body('email').optional().isEmail(),
            body('expires').optional().isISO8601(),
            body('ref_link').optional().isString(),
            handleValidationErrors
        ],
        async (req, res) => {
            try {
                const { id } = req.params;
                const data = req.body;
                const proxyWorker = await prisma.proxyWorker.update({
                    where: { id },
                    data
                });
                res.json(proxyWorker);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to update ProxyWorker' });
            }
        }
    );



    /**
     * @swagger
     * /proxy-client/{id}:
     *   delete:
     *     summary: Удалить ProxyClient по ID
     *     tags: [ProxyClient]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: UUID ProxyClient
     *     responses:
     *       204:
     *         description: Успешно удалено
     *       500:
     *         description: Ошибка на сервере
     */
    router.delete(
        '/:id',
        [param('id').isUUID(), handleValidationErrors],
        async (req, res) => {
            try {
                const { id } = req.params;
                await prisma.proxyWorker.delete({
                    where: { id }
                });
                res.status(204).send();
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Failed to delete ProxyWorker' });
            }
        }
    );




    return router;


}



