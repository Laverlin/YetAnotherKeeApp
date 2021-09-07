const { spawn } = require('child_process');
const fs = require('fs');

const buildNumberFile = 'build.number.json'

try {

  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const year = new Date().getFullYear().toString().substr(2);
  const buffer = readBuildNumberFile(buildNumberFile);
  let build = buffer ? Number(buffer) : 0;
  const version = `1.${year}${dayOfYear}.${++build}`;
  const commandLine = `electron-builder build -c.extraMetadata.version=${version} --publish never`;
  console.log(`build version: ${version}`);
  console.log(`run: ${commandLine}`);

  const process = spawn('cmd', [
    '/c',
    'electron-builder',
    'build',
    `-c.extraMetadata.version=${version}`,
    '-p',
    'never'
  ], {stdio: "inherit"});

  process.on('error', chunk => console.log(chunk));
  process.on('close', code => console.log(`builder exited with code ${code}`));

  fs.writeFileSync(buildNumberFile, build.toString(), {encoding: 'utf-8'});
}
catch(error) {
  console.log(error);
}

function readBuildNumberFile(fileName) {
  try {
    fs.readFileSync(buildNumberFile, {encoding: 'utf-8'});
    return fs.readFileSync(buildNumberFile, {encoding: 'utf-8'});
  }
  catch {
    console.log('error reading build number file, will use default 0');
    return undefined;
  }
}
