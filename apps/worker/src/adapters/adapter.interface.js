"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolateTemplate = interpolateTemplate;
function interpolateTemplate(template, data) {
    if (!template)
        return '';
    return template.replace(/\{\{\s*event\.([a-zA-Z0-9_.]+)\s*\}\}/g, (_, path) => {
        const parts = path.split('.');
        let val = data;
        for (const p of parts) {
            if (val === null || val === undefined)
                return '';
            val = val[p];
        }
        return val !== undefined ? String(val) : '';
    });
}
//# sourceMappingURL=adapter.interface.js.map