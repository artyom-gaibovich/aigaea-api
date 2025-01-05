const {Router} = require("express");


module.exports = () => {
    const router = Router()


    /**
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
    router.post("/proxies", (req, res) => {

    })
}