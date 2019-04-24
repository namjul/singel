#!/usr/bin/env node
"use strict";

var _path = require("path");

var _commander = _interopRequireDefault(require("commander"));

var _glob = _interopRequireDefault(require("glob"));

var _findBabelConfig = _interopRequireDefault(require("find-babel-config"));

var _ReactTester = _interopRequireDefault(require("./ReactTester"));

var _Logger = _interopRequireDefault(require("./Logger"));

var _babelConfig = _interopRequireDefault(require("./babelConfig"));

var _package = require("../package.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version(_package.version, "-v, --version").option("-i, --ignore <path>", "Path to ignore").parse(process.argv);

const run = (paths, {
  ignore
}) => {
  _Logger.default.writeln();

  const realPaths = paths.reduce((acc, path) => [...acc, ..._glob.default.sync(path, {
    ignore,
    nodir: true
  })], []);

  const _findBabelConfig$sync = _findBabelConfig.default.sync(realPaths[0]),
        file = _findBabelConfig$sync.file;

  const finalBabelConfig = file ? {
    plugins: _babelConfig.default.plugins
  } : _babelConfig.default;

  require("@babel/register")(finalBabelConfig);

  let hasErrors = false;
  let lastHasError = false;

  const exit = () => {
    _Logger.default.summary(!lastHasError);

    process.exit(hasErrors ? 1 : 0);
  };

  realPaths.forEach((path, i) => {
    const absolutePath = (0, _path.isAbsolute)(path) ? path : (0, _path.resolve)(process.cwd(), path);
    const relativePath = (0, _path.relative)(process.cwd(), absolutePath);

    const _require = require(absolutePath),
          Element = _require.default;

    const tester = new _ReactTester.default(Element);
    const logger = new _Logger.default(Element, relativePath);
    if (!logger.validateElement()) return;
    logger.start();
    tester.on("error", message => {
      hasErrors = true;
      logger.addError(message);
    });
    tester.on("end", failed => {
      if (failed) {
        logger.fail(i > 0 && !lastHasError);
        lastHasError = true;
      } else {
        logger.succeed();
        lastHasError = false;
      }
    });
    tester.run();
  });
  exit();
};

run(_commander.default.args, _commander.default);