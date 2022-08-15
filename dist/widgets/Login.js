"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginComponent = void 0;
const react_1 = __importDefault(require("react"));
const styles_1 = require("./styles");
const LoginComponent = ({ setAuthToken }) => (react_1.default.createElement("div", { style: styles_1.wrapper },
    react_1.default.createElement("input", { placeholder: "username" }),
    react_1.default.createElement("input", { placeholder: "password" }),
    react_1.default.createElement("button", { onClick: () => setAuthToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NjhiMTllYS1lN2Q0LTQ0M2QtYmQzOS1mOGNiY2RhZDBhZWUiLCJ1c2VybmFtZSI6IjEiLCJpYXQiOjE2NjAzMTc1MjJ9.yFTqkLUVyVRnB54-5FCyB0XWo0Xtr6ORWksnizyzOrc") }, "Login")));
exports.LoginComponent = LoginComponent;
//# sourceMappingURL=Login.js.map