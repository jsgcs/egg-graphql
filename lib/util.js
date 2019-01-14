'use strict';

const fs = require('fs');

module.exports = {
	fileExistsSync(path, extensions) {
		for (let i = 0, len = extensions.length; i < len; ++i) {
			const p = path + extensions[i];
			if (fs.existsSync(p)) return p;
		}
		return false;
	},
};