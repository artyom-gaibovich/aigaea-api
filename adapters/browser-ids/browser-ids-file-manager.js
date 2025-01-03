const fs = require('fs');
class BrowserIdsFileManager {

    async read(browserIdFilePath) {
        try {
            const data = await readFile(browserIdFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return {};
        }
    }

    async save(browserIdFilePath, browserIds) {
        try {
            await fs.writeFileSync(browserIdFilePath, JSON.stringify(browserIds, null, 2), 'utf-8');
            console.log('Browser IDs saved to file.');
        } catch (error) {
            console.error('Error saving browser IDs:', error);
        }
    }


}

module.exports = BrowserIdsFileManager;