const { addBabelPlugin, override } = require('customize-cra');

console.log('Adding Styled jsx');

module.exports = override(
  override(addBabelPlugin('styled-jsx/babel'))
);
