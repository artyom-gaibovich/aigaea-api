const {join} = require("node:path");

class FileEntity {
    constructor(browser_id) {
        this.browser_id = browser_id;
        this.browserIdFilePath = join(__dirname, '..', '..', '..', 'uploads', `${browser_id}-browser_ids.json`);
    }

    toJSON() {
        return {
            browser_id: this.browser_id,
            browserIdFilePath: this.browserIdFilePath,
        };
    }
}

module.exports = FileEntity;