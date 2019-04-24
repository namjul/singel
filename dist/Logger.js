"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _ora = _interopRequireDefault(require("ora"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// $FlowFixMe
console.error = () => {};

class Logger {
  static summary(lineBreakAtTop) {
    if (lineBreakAtTop) {
      Logger.writeln();
    }

    Logger.writeln(`${Logger.elementsCount} elements`);
    Logger.writeln(Logger.totalErrorCount ? `${_chalk.default.red(`${Logger.totalErrorCount} errors`)}` : `${_chalk.default.green("0 errors")}`);
    Logger.writeln();
  }

  static writeln(text = "") {
    return process.stdout.write(`${text}\n`);
  }

  constructor(Element, path, {
    maxErrors = 10
  } = {}) {
    _defineProperty(this, "element", void 0);

    _defineProperty(this, "path", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "loader", void 0);

    _defineProperty(this, "errors", []);

    this.element = Element;
    this.path = path;
    this.options = {
      maxErrors
    };
    Logger.elementsCount += 1;
  }

  start() {
    const elementName = this.element.displayName || this.element.name;
    this.loader = (0, _ora.default)({
      text: `${_chalk.default.bold(elementName)} ${_chalk.default.gray(_chalk.default.underline(this.path))}`,
      hideCursor: false
    }).start();
  }

  validateElement() {
    if (this.element === undefined) {
      Logger.writeln(_chalk.default.red(`ERROR: You are missing a default export in ${this.path}`));
      Logger.elementsCount -= 1;
      return false;
    }

    return true;
  }

  addError(message) {
    this.errors.push(`  ${_chalk.default.red(message)}`);
    Logger.totalErrorCount += 1;
  }

  fail(lineBreakAtTop) {
    const loader = this.loader,
          errors = this.errors,
          options = this.options;
    loader.clear();

    if (lineBreakAtTop) {
      Logger.writeln();
    }

    loader.enabled = true;
    loader.fail();
    errors.slice(0, options.maxErrors).forEach(error => Logger.writeln(error));

    if (errors.length > options.maxErrors) {
      const remaining = errors.length - options.maxErrors;
      Logger.writeln(_chalk.default.yellow(`  ... and ${remaining} more errors.`));
    }

    Logger.writeln();
  }

  succeed() {
    this.loader.enabled = true;
    this.loader.succeed();
  }

}

_defineProperty(Logger, "elementsCount", 0);

_defineProperty(Logger, "totalErrorCount", 0);

var _default = Logger;
exports.default = _default;