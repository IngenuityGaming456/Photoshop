/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./js/main.ts":
/*!********************!*\
  !*** ./js/main.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// import {PanelModel} from \"./model/PanelModel\";\r\n// import * as EventEmitter from \"events\";\r\n// import {StateContext} from \"./states/context\";\r\n// import {PanelControllerApp} from \"./controller/PanelControllerApp\";\r\n// import {PanelViewApp} from \"./view/PanelViewApp\";\r\n// import {SelfPanelModel} from \"./model/SelfPanelModel\";\r\n// import {SelfPanelView} from \"./view/SelfPanelView\";\r\n// import {SelfPanelController} from \"./controller/SelfPanelController\";\r\n// import {MappingView} from \"./view/MappingView\";\r\nfunction main() {\r\n    // const eventsObj = new EventEmitter();\r\n    // const stateContext = new StateContext();\r\n    // const modelObj = new PanelModel(eventsObj);\r\n    // const viewObj = new PanelViewApp(eventsObj);\r\n    // new MappingView(eventsObj);\r\n    // new PanelControllerApp(eventsObj, viewObj, modelObj, stateContext);\r\n    // const selfEventsObj = new EventEmitter();\r\n    // const selfModelObj = new SelfPanelModel(selfEventsObj);\r\n    // const selfViewObj = new SelfPanelView(selfEventsObj);\r\n    // new SelfPanelController(selfEventsObj, selfViewObj, selfModelObj, stateContext)\r\n}\r\nmain();\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9qcy9tYWluLnRzLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL2pzL21haW4udHM/YTBlZCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQge1BhbmVsTW9kZWx9IGZyb20gXCIuL21vZGVsL1BhbmVsTW9kZWxcIjtcclxuLy8gaW1wb3J0ICogYXMgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcclxuLy8gaW1wb3J0IHtTdGF0ZUNvbnRleHR9IGZyb20gXCIuL3N0YXRlcy9jb250ZXh0XCI7XHJcbi8vIGltcG9ydCB7UGFuZWxDb250cm9sbGVyQXBwfSBmcm9tIFwiLi9jb250cm9sbGVyL1BhbmVsQ29udHJvbGxlckFwcFwiO1xyXG4vLyBpbXBvcnQge1BhbmVsVmlld0FwcH0gZnJvbSBcIi4vdmlldy9QYW5lbFZpZXdBcHBcIjtcclxuLy8gaW1wb3J0IHtTZWxmUGFuZWxNb2RlbH0gZnJvbSBcIi4vbW9kZWwvU2VsZlBhbmVsTW9kZWxcIjtcclxuLy8gaW1wb3J0IHtTZWxmUGFuZWxWaWV3fSBmcm9tIFwiLi92aWV3L1NlbGZQYW5lbFZpZXdcIjtcclxuLy8gaW1wb3J0IHtTZWxmUGFuZWxDb250cm9sbGVyfSBmcm9tIFwiLi9jb250cm9sbGVyL1NlbGZQYW5lbENvbnRyb2xsZXJcIjtcclxuLy8gaW1wb3J0IHtNYXBwaW5nVmlld30gZnJvbSBcIi4vdmlldy9NYXBwaW5nVmlld1wiO1xyXG5cclxuZnVuY3Rpb24gbWFpbigpIHtcclxuICAgIC8vIGNvbnN0IGV2ZW50c09iaiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIC8vIGNvbnN0IHN0YXRlQ29udGV4dCA9IG5ldyBTdGF0ZUNvbnRleHQoKTtcclxuICAgIC8vIGNvbnN0IG1vZGVsT2JqID0gbmV3IFBhbmVsTW9kZWwoZXZlbnRzT2JqKTtcclxuICAgIC8vIGNvbnN0IHZpZXdPYmogPSBuZXcgUGFuZWxWaWV3QXBwKGV2ZW50c09iaik7XHJcbiAgICAvLyBuZXcgTWFwcGluZ1ZpZXcoZXZlbnRzT2JqKTtcclxuICAgIC8vIG5ldyBQYW5lbENvbnRyb2xsZXJBcHAoZXZlbnRzT2JqLCB2aWV3T2JqLCBtb2RlbE9iaiwgc3RhdGVDb250ZXh0KTtcclxuICAgIC8vIGNvbnN0IHNlbGZFdmVudHNPYmogPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICAvLyBjb25zdCBzZWxmTW9kZWxPYmogPSBuZXcgU2VsZlBhbmVsTW9kZWwoc2VsZkV2ZW50c09iaik7XHJcbiAgICAvLyBjb25zdCBzZWxmVmlld09iaiA9IG5ldyBTZWxmUGFuZWxWaWV3KHNlbGZFdmVudHNPYmopO1xyXG4gICAgLy8gbmV3IFNlbGZQYW5lbENvbnRyb2xsZXIoc2VsZkV2ZW50c09iaiwgc2VsZlZpZXdPYmosIHNlbGZNb2RlbE9iaiwgc3RhdGVDb250ZXh0KVxyXG59XHJcbm1haW4oKTsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./js/main.ts\n");

/***/ })

/******/ });