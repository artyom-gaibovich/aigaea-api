
module.exports = ({prisma}) => {
    const checkBilling = async (req, res, next) => {
        const clientId = req.params.id;

        if (!clientId) {
            return res.status(401).json({error: 'Не авторизованы. Но можете !'});
        }
        try {
            const client = await prisma.proxyClient.findUnique({
                where: {id: clientId},
            });
            if (!client) {
                return res.status(404).json({error: 'Client not found'});
            }
            if (client.expires && new Date(client.expires) < new Date()) {
                return res.status(403).json({error: 'Подписка истекла. Обновите подписку'});
            }
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({error: 'Internal Server Error'});
        }
    };
    return {
        checkBilling,
    }
};