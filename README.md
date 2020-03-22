# http://hqjs.org
Support-nodejs globals
* Buffer - adds `import Buffer from 'buffer';` on top of the program [npm buffer package](https://www.npmjs.com/package/buffer) should be installed as project dependency
* process - adds `iport process from 'process';` on top of the program [npm process package](https://www.npmjs.com/package/process) should be installed as a project dependency
* setImmediate/clearImmediate - adds `import 'setimmediate';` on top of the program [npm setimmediate package](https://www.npmjs.com/package/setimmediate) should be installed as a project dependency
* global - changes to `globalThis` (which has polyfill in core-js)
* __dirname - substitutes exact value
* __filename - substitutes exact value

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
