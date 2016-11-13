var createKeyMap = require('./keymap.js');

module.exports = verifyOptions;

function verify(obj) {
  return {
    required: function required(name) {
      if (obj[name] === undefined) {
        throw new Error(name + ' is required!')
      }
      return this;
    },
    optional: function (name, defaultValue) {
      if (obj[name] === undefined) {
        obj[name] = defaultValue
      }
      return this;
    },
    merge: function (name, defaultValue) {
      obj[name] = Object.assign({}, defaultValue, obj[name]);
      return this;
    },
    done: function () {
      return obj;
    }
  }
}

function verifyOptions(options) {
  return verify(options)
    .required('camera')
    .required('THREE')
    .optional('domElement', document)
    .merge('keyMap', createKeyMap())
    .done()
}