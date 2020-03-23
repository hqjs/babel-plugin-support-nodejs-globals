# http://hqjs.org
Support-nodejs globals
* Buffer - adds `import Buffer from 'buffer';` on top of the program [npm buffer package](https://www.npmjs.com/package/buffer)
* process - adds `iport process from 'process';` on top of the program [npm process package](https://www.npmjs.com/package/process)
* __dirname - substitutes exact value
* __filename - substitutes exact value
* global - changes to `globalThis` (which has polyfill in core-js) works in combination with globals above

# Installation
```sh
npm install hqjs@babel-plugin-support-nodejs-globals
```

# Usage
```json
{
  "plugins": ["hqjs@babel-plugin-support-nodejs-globals"]
}
```
