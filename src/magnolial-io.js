var _ = require('underscore');
var isNode = require('detect-node');

if (isNode){
    module.exports = require('./node-io');
} else {
    module.exports = require('./browser-io');
}
