const path = require('path');

const importVisitor = (t, required) => ({
  ImportDeclaration(nodePath) {
    const {source} = nodePath.node;
    if (source.value === 'buffer') required.Buffer = false;
    else if (source.value === 'process' || source.value === 'process/browser.js') {
      source.value = 'process/browser.js';
      required.process = false;
    }
  },
  CallExpression(nodePath) {
    const {node} = nodePath;
    if (!t.isIdentifier(node.callee, {name: 'require'})) return;
    const [source] = node.arguments;
    if (source.value === 'buffer') required.Buffer = false;
    else if (source.value === 'process' || source.value === 'process/browser.js') {
      source.value = 'process/browser.js';
      required.process = false;
    }
  }
});

module.exports = function ({ types: t }) {
  let programPath;
  const required = {
    Buffer: true,
    process: true,
  };
  return {
    visitor: {
      Program(nodePath) {
        required.Buffer = true;
        required.process = true;
        programPath = nodePath;
        nodePath.traverse(importVisitor(t, required));
      },
      Identifier(nodePath, stats) {
        const {filename} = stats;
        const dirname = path.dirname(filename);
        const {node} = nodePath;
        if (node.name === '__filename' && !nodePath.scope.hasBinding('__filename')) {
          if (
            nodePath.parentPath.isMemberExpression() &&
            (nodePath.parent.object.name === 'global' || nodePath.parent.object.name === 'globalThis')
          ) nodePath.parentPath.replaceWith(nodePath);
          nodePath.replaceWith(t.stringLiteral(filename));
        } else if (node.name === '__dirname' && !nodePath.scope.hasBinding('__dirname')) {
          if (
            nodePath.parentPath.isMemberExpression() &&
            (nodePath.parent.object.name === 'global' || nodePath.parent.object.name === 'globalThis')
          ) nodePath.parentPath.replaceWith(nodePath);
          nodePath.replaceWith(t.stringLiteral(dirname));
        } else if (node.name === 'Buffer' && !nodePath.scope.hasBinding('Buffer')) {
          const id = nodePath.scope.generateUidIdentifierBasedOnNode('globals');
          if (
            nodePath.parentPath.isMemberExpression() &&
            (nodePath.parent.object.name === 'global' || nodePath.parent.object.name === 'globalThis')
          ) nodePath.parentPath.replaceWith(nodePath);
          if (
            required.Buffer &&
            (
              !nodePath.parentPath.isMemberExpression() ||
              nodePath.parent.object === node
            )
          ) {
            programPath.node.body.unshift(
              t.importDeclaration(
                [t.importDefaultSpecifier(id)],
                t.stringLiteral('buffer')
              ),
              t.variableDeclaration(
                'const',
                [t.variableDeclarator(node, id)]
              )
            );
            required.Buffer = false;
          }
        } else if (node.name === 'process' && !nodePath.scope.hasBinding('process')) {
          if (
            nodePath.parentPath.isMemberExpression() &&
            (nodePath.parent.object.name === 'global' || nodePath.parent.object.name === 'globalThis')
          ) nodePath.parentPath.replaceWith(nodePath);
          if (
            required.process &&
            (
              !nodePath.parentPath.isMemberExpression() ||
              nodePath.parent.object === node
            )
          ) {
            programPath.node.body.unshift(t.importDeclaration(
              [t.importDefaultSpecifier(node)],
              t.stringLiteral('process/browser.js')
            ));
            required.process = false;
          }
        } else if (node.name === 'global' && !nodePath.scope.hasBinding('global')) {
          node.name = 'globalThis';
        }
      }
    },
  };
};
