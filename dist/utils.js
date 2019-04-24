"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMissingClassName = exports.isVoidElement = exports.getEventName = exports.getReactEventHandlers = exports.getReactProps = exports.getStyleProps = exports.getHTMLTag = exports.findHTMLTag = exports.findHTMLTags = void 0;

var _knownCssProperties = require("known-css-properties");

var _voidElements = _interopRequireDefault(require("void-elements"));

var _sinon = require("sinon");

var _lodash = require("lodash");

var _reactKnownProps = require("react-known-props");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const reducer = (acc, key) => _objectSpread({}, acc, {
  [key]: key
});

const findHTMLTags = wrapper => wrapper.findWhere(el => typeof el.type() === "string");

exports.findHTMLTags = findHTMLTags;

const findHTMLTag = wrapper => findHTMLTags(wrapper).first();

exports.findHTMLTag = findHTMLTag;

const getHTMLTag = wrapper => {
  const tag = findHTMLTag(wrapper);
  return tag.length ? tag.type() : undefined;
};

exports.getHTMLTag = getHTMLTag;

const getStyleProps = () => _knownCssProperties.all.filter(prop => !/^-/.test(prop)).map(_lodash.camelCase).reduce(reducer, {});

exports.getStyleProps = getStyleProps;

const getReactProps = type => {
  const excludeProps = ["style", "className", "dangerouslySetInnerHTML"];
  const excludePropsRegex = new RegExp(`^${excludeProps.join("|")}$`);
  const props = type ? (0, _reactKnownProps.getElementProps)(type) : (0, _reactKnownProps.getGlobalProps)();
  return props.filter(prop => !excludePropsRegex.test(prop)).reduce(reducer, {});
};

exports.getReactProps = getReactProps;

const getReactEventHandlers = () => (0, _reactKnownProps.getEventProps)().reduce((acc, key) => _objectSpread({}, acc, {
  [key]: (0, _sinon.spy)()
}), {});

exports.getReactEventHandlers = getReactEventHandlers;

const getEventName = (prop = "") => {
  const eventName = prop.replace(/^on/, "");
  return eventName.charAt(0).toLowerCase() + eventName.slice(1);
};

exports.getEventName = getEventName;

const isVoidElement = wrapper => !!_voidElements.default[getHTMLTag(wrapper)];

exports.isVoidElement = isVoidElement;

const getMissingClassName = (originalClassName = "", renderedClassName = "") => {
  const originalArray = originalClassName.split(" ");
  const renderedArray = renderedClassName.split(" ");
  const intersectionArray = (0, _lodash.intersection)(originalArray, renderedArray);
  const differenceArray = (0, _lodash.difference)(originalArray, intersectionArray);
  return differenceArray.filter(c => c !== "undefined").join(" ");
};

exports.getMissingClassName = getMissingClassName;