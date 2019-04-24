"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _lodash = require("lodash");

var _enzyme = require("enzyme");

var _enzymeAdapterReact = _interopRequireDefault(require("enzyme-adapter-react-16"));

var _jsdom = require("jsdom");

var _events = _interopRequireDefault(require("events"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(0, _enzyme.configure)({
  adapter: new _enzymeAdapterReact.default()
});

const _ref = new _jsdom.JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true
}),
      window = _ref.window;

global.window = window;
Object.keys(window).filter(key => ["localStorage", "sessionStorage"].indexOf(key) === -1).forEach(key => {
  if (typeof global[key] === "undefined") {
    global[key] = window[key];
  }
});

class Tester extends _events.default {
  constructor(Element) {
    super();

    _defineProperty(this, "element", void 0);

    _defineProperty(this, "testBreak", () => {
      try {
        this.mount();
      } catch (e) {
        this.emit("error", `Don't break: ${e.message}`);
        this.emit("break");
      }
    });

    _defineProperty(this, "testOneElement", () => {
      const wrapper = this.mount();
      const tags = (0, _utils.findHTMLTags)(wrapper);
      const tagsString = tags.map(t => t.type()).join(" > ");

      if (tags.length > 1) {
        this.emit("error", `Render only one element: ${tagsString}`);
      }
    });

    _defineProperty(this, "testChildren", () => {
      const wrapper = this.mount();
      if (!(0, _utils.getHTMLTag)(wrapper)) return;

      if (!(0, _utils.isVoidElement)(wrapper)) {
        wrapper.setProps({
          children: "children"
        });

        if (!wrapper.contains("children")) {
          this.emit("error", "Render children passed as prop.");
        }
      }
    });

    _defineProperty(this, "testHTMLProps", () => {
      const originalWrapper = this.mount();
      if (!(0, _utils.getHTMLTag)(originalWrapper)) return;
      const type = (0, _utils.findHTMLTag)(originalWrapper).type();
      const reactProps = (0, _utils.getReactProps)(type);
      const wrapper = this.mount(reactProps);
      const props = (0, _utils.findHTMLTag)(wrapper).props();
      Object.keys(reactProps).forEach(prop => {
        if (!props[prop]) {
          this.emit("error", `Render HTML attributes passed as props: ${prop}`);
        } else if (props[prop] !== reactProps[prop]) {
          this.emit("error", `Override internal HTML attributes with props: ${prop}`);
        }
      });
    });

    _defineProperty(this, "testClassName", () => {
      const originalWrapper = this.mount();
      if (!(0, _utils.getHTMLTag)(originalWrapper)) return;
      const originalClassName = (0, _utils.findHTMLTag)(originalWrapper).prop("className");
      const className = "foobarbaz";
      const wrapper = this.mount({
        className
      });
      const renderedClassName = (0, _utils.findHTMLTag)(wrapper).prop("className") || "";
      const renderedClassNames = renderedClassName.split(" ");

      if (!renderedClassNames.includes(className)) {
        this.emit("error", "Render className passed as prop.");
      }

      const missingClassName = (0, _utils.getMissingClassName)(originalClassName, renderedClassName);

      if (missingClassName) {
        this.emit("error", `Don't override internal className: ${missingClassName}`);
      }
    });

    _defineProperty(this, "testStyle", () => {
      const style = (0, _utils.getStyleProps)();
      const wrapper = this.mount({
        style
      });
      if (!(0, _utils.getHTMLTag)(wrapper)) return;
      const renderedStyle = (0, _utils.findHTMLTag)(wrapper).prop("style") || {};
      Object.keys(style).forEach(prop => {
        if (typeof renderedStyle[prop] === "undefined") {
          this.emit("error", `Render style passed as prop: ${prop}`);
        } else if (renderedStyle[prop] !== style[prop]) {
          this.emit("error", `Override internal style prop with props: ${prop}`);
        }
      });
    });

    _defineProperty(this, "testInternalStyle", () => {
      const originalWrapper = this.mount();
      if (!(0, _utils.getHTMLTag)(originalWrapper)) return;
      const originalStyle = (0, _utils.findHTMLTag)(originalWrapper).prop("style") || {};
      const style = (0, _lodash.omit)((0, _utils.getStyleProps)(), Object.keys(originalStyle));
      const wrapper = this.mount({
        style
      });
      const renderedStyle = (0, _utils.findHTMLTag)(wrapper).prop("style") || {};
      Object.keys(originalStyle).forEach(prop => {
        if (!renderedStyle[prop]) {
          this.emit("error", `Don't override the entire internal style with props: ${prop}`);
        }
      });
    });

    _defineProperty(this, "testEventHandlers", () => {
      const eventHandlers = (0, _utils.getReactEventHandlers)();
      const wrapper = this.mount(eventHandlers);
      if (!(0, _utils.getHTMLTag)(wrapper)) return;
      Object.keys(eventHandlers).forEach(prop => {
        const event = eventHandlers[prop];

        try {
          wrapper.simulate((0, _utils.getEventName)(prop));
        } catch (e) {
          this.emit("error", `Don't break: ${e.message}`);
        }

        if (!event.called) {
          this.emit("error", `Call event handlers passed as props: ${prop}`);
        } else {
          const _event$getCall$args = _slicedToArray(event.getCall(0).args, 1),
                argument = _event$getCall$args[0];

          if (!argument || argument.constructor.name !== "SyntheticEvent") {
            this.emit("error", `Pass SyntheticEvent to event handlers passed as props: ${prop}`);
          }
        }
      });
    });

    this.element = Element;
  }

  mount(props) {
    return (0, _enzyme.mount)(_react.default.createElement(this.element, props));
  }

  run() {
    let shouldStop = false;
    let failed = false;
    this.once("break", () => {
      shouldStop = true;
    });
    this.once("error", () => {
      failed = true;
    });
    const tests = [this.testBreak, this.testOneElement, this.testChildren, this.testHTMLProps, this.testClassName, this.testStyle, this.testInternalStyle, this.testEventHandlers];
    this.emit("start");
    tests.forEach(test => shouldStop || test());
    this.emit("end", failed);
  }

}

var _default = Tester;
exports.default = _default;