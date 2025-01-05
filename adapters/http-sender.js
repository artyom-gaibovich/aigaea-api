const {HttpsProxyAgent} = require("https-proxy-agent");

class HttpSender {

    constructor() {
    }

    async send(url, method, payloadData = null, proxy, headers) {
        const fetch = (await import('node-fetch')).default;
        try {
            const agent = new HttpsProxyAgent(proxy);
            let response;
            const options = {
                method: method,
                headers: headers,
                agent: agent
            };

            if (method === 'POST') {
                options.body = JSON.stringify(payloadData);
                response = await fetch(url, options);
            } else {
                response = await fetch(url, options);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error with proxy:', proxy);
        }
    }
}

module.exports = HttpSender;