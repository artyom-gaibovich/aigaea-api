
module.exports = ({prisma}) => {
    return {
        checkBillingMiddleware: require('./check-billing/check-billing.middleware')({prisma})
    }
}