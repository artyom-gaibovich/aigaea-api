const {join} = require("node:path");

class FileEntity {
    constructor(browserId) {
        this.browserId = browserId;
        this.filePath = join(__dirname, '..', '..', '..', 'uploads', `${browserId}-browser_ids.json`);
    }

    toJSON() {
        return {
            browserId: this.browserId,
            filePath: this.filePath,
        };
    }
}

module.exports = FileEntity;