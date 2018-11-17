const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

const getAllFiles = (dir) =>
	fs.readdirSync(dir)
		.reduce((files, file) =>
			fs.statSync(path.join(dir, file)).isDirectory() ?
				files.concat(getAllFiles(path.join(dir, file))) :
				files.concat(path.join(dir, file)),
		[]);

function turnOffDelays(file) {
	const options = {
		files: file,
		from: /65,./,
		to: '65,=0'
	};
	try {
		replace.sync(options);
	}
	catch (error) {
		console.error('Error occurred:', error);
	}
}

getAllFiles(process.argv[2]).forEach(turnOffDelays);
