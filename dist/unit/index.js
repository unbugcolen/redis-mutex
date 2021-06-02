"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessMutex = exports.safeFloatPremiumCalc = exports.sleep = void 0;
const process_mutex_1 = require("./process_mutex");
exports.ProcessMutex = process_mutex_1.default;
function sleep(time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
exports.sleep = sleep;
function safeFloatPremiumCalc(value, fractionDigits = 0) {
    return Number(value.toFixed(fractionDigits));
}
exports.safeFloatPremiumCalc = safeFloatPremiumCalc;
//# sourceMappingURL=index.js.map