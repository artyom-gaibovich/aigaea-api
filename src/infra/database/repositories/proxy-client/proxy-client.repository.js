
class ProxyClientRepository {

    /**
     *
     * @param prisma
     */
    constructor(prisma) {
        this.prisma = prisma;
    }


    /**
     *
     * @param id {string}
     * @returns {Promise<Prisma.Prisma__ProxyClientClient<GetResult<Prisma.$ProxyClientPayload<ExtArgs>, {include: {ClientsToProxies: {include: {proxy: boolean}}}, where: {id}}, "findUnique"> | null, null, ExtArgs>>}
     */
    async findByIdWithProxies(id) {
        return this.prisma.proxyClient.findUnique({
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
    }

    async findAllWithProxies() {
        return this.prisma.proxyClient.findMany({
            include: {
                ClientsToProxies: {
                    include: {
                        proxy: true,
                    },
                },
            },
        });
    }

}

module.exports = ProxyClientRepository;