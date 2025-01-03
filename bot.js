const path = require("path");
const crypto = require("crypto");
const {promises: fs} = require("fs");
const {HttpsProxyAgent} = require("https-proxy-agent");


async function start(accessToken, id8, proxyList) {
    const fetch = (await import('node-fetch')).default;
    const fs = require('fs').promises;
    const {HttpsProxyAgent} = require('https-proxy-agent');
    const path = require('path');
    const crypto = require('crypto');
    let headers = {
        'Accept': 'application/json, text/plain, */*',
        'origin': 'chrome-extension://cpjicfogbgognnifjgmenmaldnmeeeib',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    };

    const browserIdFilePath = path.join(__dirname, `${id8}-browser_ids.json`);

    async function coday(url, method, payloadData = null, proxy, headers) {
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

            return await response.json();
        } catch (error) {
            console.error('Error with proxy:', proxy);
        }
    }

    function generateBrowserId() {
        const rdm = crypto.randomUUID().slice(8);
        const browserId = `${id8}${rdm}`
        return browserId;
    }

    async function loadBrowserIds() {
        try {
            const data = await fs.readFile(browserIdFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return {};
        }
    }

    async function saveBrowserIds(browserIds) {
        try {
            await fs.writeFile(browserIdFilePath, JSON.stringify(browserIds, null, 2), 'utf-8');
            console.log('Browser IDs saved to file.');
        } catch (error) {
            console.error('Error saving browser IDs:', error);
        }
    }

    async function getBrowserId(proxy) {
        const browserIds = await loadBrowserIds();
        if (browserIds[proxy]) {
            console.log(`Using existing browser_id for proxy ${proxy}`);
            return browserIds[proxy];
        } else {
            const newBrowserId = generateBrowserId();
            browserIds[proxy] = newBrowserId;  // Save new browser_id for the proxy
            await saveBrowserIds(browserIds);
            console.log(`Generated new browser_id for proxy ${proxy}: ${newBrowserId}`);
            return newBrowserId;
        }
    }

    function getCurrentTimestamp() {
        return Math.floor(Date.now() / 1000);
    }

    async function pingProxy(proxy, browser_id, uid) {
        const timestamp = getCurrentTimestamp();
        const pingPayload = {"uid": uid, "browser_id": browser_id, "timestamp": timestamp, "version": "1.0.1"};

        while (true) {
            try {
                const pingResponse = await coday('https://api.aigaea.net/api/network/ping', 'POST', pingPayload, proxy);
                await coday('https://api.aigaea.net/api/network/ip', 'GET', {}, proxy)
                console.log(`Ping successful for proxy ${proxy}:`, pingResponse);

                // Check the score т
                if (pingResponse.data && pingResponse.data.score < 50) {
                    console.log(`Score below 50 for proxy ${proxy}, re-authenticating...`);

                    // Re-authenticate and restart pinging with a new browser_id
                    await handleAuthAndPing(proxy);
                    break;
                }
            } catch (error) {
                console.error(`Ping failed for proxy ${proxy}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));  // Wait 10 minutes before the next ping
        }
    }

    async function handleAuthAndPing(proxy) {
        const payload = {};
        const authResponse = await coday("https://api.aigaea.net/api/auth/session", 'POST', payload, proxy);

        if (authResponse && authResponse.data) {
            const uid = authResponse.data.uid;
            const browser_id = await getBrowserId(proxy);  // Get or generate a unique browser_id for this proxy
            console.log(`Authenticated for proxy ${proxy} with uid ${uid} and browser_id ${browser_id}`);

            // Start pinging
            pingProxy(proxy, browser_id, uid);
        } else {
            console.error(`Authentication failed for proxy ${proxy}`);
        }
    }

    try {
        const proxies = proxyList.split('\n').map(proxy => proxy.trim()).filter(proxy => proxy);
        if (proxies.length === 0) {
            console.error("No proxies found in proxy.txt");
            return;
        }
        const tasks = proxies.map(proxy => handleAuthAndPing(proxy));
        await Promise.all(tasks);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}


async function coday(url, method, payloadData = null, proxy, headers) {
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

        return await response.json();
    } catch (error) {
        console.error('Error with proxy:', proxy);
    }
}
function generateBrowserId(id8) {
    const rdm = crypto.randomUUID().slice(8);
    const browserId = `${id8}${rdm}`
    return browserId;
}



async function loadBrowserIds(browserIdFilePath) {
    try {
        const data = await fs.readFile(browserIdFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}





async function saveBrowserIds(browserIds, browserIdFilePath) {
    try {
        await fs.writeFile(browserIdFilePath, JSON.stringify(browserIds, null, 2), 'utf-8');
        console.log('Browser IDs saved to file.');
    } catch (error) {
        console.error('Error saving browser IDs:', error);
    }
}
async function getBrowserId(proxy, id8, browserIdFilePath) {
    const browserIds = await loadBrowserIds(browserIdFilePath);
    if (browserIds[proxy]) {
        console.log(`Using existing browser_id for proxy ${proxy}`);
        return browserIds[proxy];
    } else {
        const newBrowserId = generateBrowserId(id8);
        browserIds[proxy] = newBrowserId;  // Save new browser_id for the proxy
        await saveBrowserIds(browserIds, browserIdFilePath);
        console.log(`Generated new browser_id for proxy ${proxy}: ${newBrowserId}`);
        return newBrowserId;
    }
}



function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}

async function pingProxy(proxy, browser_id, uid, headers) {
    const timestamp = getCurrentTimestamp();
    const pingPayload = {"uid": uid, "browser_id": browser_id, "timestamp": timestamp, "version": "1.0.1"};

    while (true) {
        try {
            const pingResponse = await coday('https://api.aigaea.net/api/network/ping', 'POST', pingPayload, proxy);
            await coday('https://api.aigaea.net/api/network/ip', 'GET', {}, proxy, headers)
            console.log(`Ping successful for proxy ${proxy}:`, pingResponse);

            // Check the score т
            if (pingResponse.data && pingResponse.data.score < 50) {
                console.log(`Score below 50 for proxy ${proxy}, re-authenticating...`);

                // Re-authenticate and restart pinging with a new browser_id
                await handleAuthAndPing(proxy);
                break;
            }
        } catch (error) {
            console.error(`Ping failed for proxy ${proxy}:`, error);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));  // Wait 10 minutes before the next ping
    }
}
async function handleAuthAndPing(proxy, id8, headers, browserIdFilePath) {
    const payload = {};
    const authResponse = await coday("https://api.aigaea.net/api/auth/session", 'POST', payload, proxy, headers);

    if (authResponse && authResponse.data) {
        const uid = authResponse.data.uid;
        const browser_id = await getBrowserId(proxy, id8, browserIdFilePath);  // Get or generate a unique browser_id for this proxy
        console.log(`Authenticated for proxy ${proxy} with uid ${uid} and browser_id ${browser_id}`);

        // Start pinging
        pingProxy(proxy, browser_id, uid, headers);
    } else {
        console.error(`Authentication failed for proxy ${proxy}`);
    }
}

class Bot {
    constructor(id8, accessToken, proxyList) {
        this.state = false;
        this.id8 = id8;
        this.accessToken = accessToken;
        this.proxyList = proxyList;

    }

    async start() {
        this.state = true;
        const fetch = (await import('node-fetch')).default;
        const fs = require('fs').promises;
        const {HttpsProxyAgent} = require('https-proxy-agent');
        const path = require('path');
        const crypto = require('crypto');
        let headers = {
            'Accept': 'application/json, text/plain, */*',
            'origin': 'chrome-extension://cpjicfogbgognnifjgmenmaldnmeeeib',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
        };

        const browserIdFilePath = path.join(__dirname, `${this.id8}-browser_ids.json`);

        try {
            const proxies = this.proxyList.split('\n').map(proxy => proxy.trim()).filter(proxy => proxy);
            if (proxies.length === 0) {
                console.error("No proxies found in proxy.txt");
                return;
            }
            const tasks = proxies.map(proxy => handleAuthAndPing(proxy, this.id8, headers, browserIdFilePath));
            await Promise.all(tasks);

        } catch (error) {
            console.error('An error occurred:', error);
        }
    }
}

module.exports = Bot;