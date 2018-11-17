const fs = require('fs');
const path = require('path');

console.log('doop', process.argv[2])

const getAllFiles = (dir) =>
	fs.readdirSync(dir)
		.reduce((files, file) =>
			fs.statSync(path.join(dir, file)).isDirectory() ?
				files.concat(getAllFiles(path.join(dir, file))) :
				files.concat(path.join(dir, file)),
		[]);

function turnOffDelaysSetPbToOct(file) {
	let preset = fs.readFileSync(file).toString();
	if(preset.match(/#cm=FX1\nModule='Delay/)) {
		preset = preset.replace(/FX1=./, 'FX1=0');
	};
	if (preset.match(/#cm=FX2\nModule='Delay/)) {
		preset = preset.replace(/FX2=./, 'FX2=0')
	}
	preset = preset.replace(/PB=.*\n/, 'PB=12\n');
	preset = preset.replace(/PBD=.*\n/, 'PBD=12\n');

	fs.writeFileSync(file, preset)
}

getAllFiles(process.argv[2]).forEach(turnOffDelaysSetPbToOct);
