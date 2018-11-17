const fs = require('fs-extra');
const path = require('path');
const name = require('project-name-generator');

const _name = name.generate().dashed;

const getAllFiles = (dir) => {
	return fs.readdirSync(dir)
		.reduce((files, file) =>
			fs.statSync(path.join(dir, file)).isDirectory() ?
				files.concat(getAllFiles(path.join(dir, file))) :
				files.concat(path.join(dir, file)),
		[])
    .sort(() => .5 - Math.random())
    .slice(0, 128);
}

function copyToDir(file, index) {
 const dest = '/SAMPLES/SLUSH/' + _name + '/' + index + '.wav';
 fs.copySync(file, dest);
}

getAllFiles('/SAMPLES/DRUMHITS/ALL').forEach(copyToDir);
