"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const arrayDelimiter = ';';
function decodeSettingArray(setting) {
    return (setting || '').split(arrayDelimiter);
}
exports.decodeSettingArray = decodeSettingArray;
function encodeSettingArray(setting) {
    return (setting || []).join(arrayDelimiter);
}
exports.encodeSettingArray = encodeSettingArray;
//# sourceMappingURL=settings_encoder.js.map