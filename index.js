const path = require('path');

const importVisitor = (t, required) => ({
  ImportDeclaration(nodePath) {
    const {source} = nodePath.node;
    if (source.value === 'buffer') required.Buffer = false;
    else if (source.value === 'process') required.process = false;
    else if (source.value === 'setimmediate') required.setimmediate = false;
  },
  CallExpression(nodePath) {
    const {node} = nodePath;
    if (!t.isIdentifier(node.callee, {name: 'require'})) return;
    const [source] = node.arguments;
    if (source.value === 'buffer') required.Buffer = false;
    else if (source.value === 'process') required.process = false;
    else if (source.value === 'setimmediate') required.setimmediate = false;
  }
});

module.exports = function ({ types: t }) {
  let programPath;
  const required = {
    Buffer: true,
    process: true,
    setimmediate: true,
  };
  return {
    visitor: {
      Program(nodePath) {
        required.Buffer = true;
        required.process = true;
        required.setimmediate = true;
        programPath = nodePath;
        nodePath.traverse(importVisitor(t, required));
      },
      Identifier(nodePath, stats) {
        const {filename} = stats;
        const dirname = path.dirname(filename);
        const {node} = nodePath;
        if (node.name === '__filename' && !nodePath.scope.hasBinding('__filename')) {
          nodePath.replaceWith(t.stringLiteral(filename));
        } else if (node.name === '__dirname' && !nodePath.scope.hasBinding('__dirname')) {
          nodePath.replaceWith(t.stringLiteral(dirname));
        } else if (node.name === 'Buffer' && !nodePath.scope.hasBinding('Buffer') && required.Buffer) {
          programPath.node.body.unshift(t.importDeclaration(
            [t.importSpecifier(node, node)],
            t.stringLiteral('buffer')
          ));
          required.Buffer = false;
        } else if (node.name === 'process' && !nodePath.scope.hasBinding('process') && required.process) {
          programPath.node.body.unshift(t.importDeclaration(
            [t.importDefaultSpecifier(node)],
            t.stringLiteral('process')
          ));
          required.process = false;
        } else if (node.name === 'global' && !nodePath.scope.hasBinding('global')) {
          node.name = 'globalThis';
        }
      },
      CallExpression(nodePath) {
        const {node} = nodePath;
        if (
          (t.isIdentifier(node.callee, {name: 'setImmediate'}) || t.isIdentifier(node.callee, {name: 'clearImmediate'})) &&
          required.setimmediate
        ) {
          programPath.node.body.unshift(t.importDeclaration(
            [],
            t.stringLiteral('setimmediate')
          ));
        }
      }
    },
  };
};
