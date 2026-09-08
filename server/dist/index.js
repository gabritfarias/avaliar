"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_routes_1 = __importDefault(require("./routes/models.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const parts_routes_1 = __importDefault(require("./routes/parts.routes"));
const evaluations_routes_1 = __importDefault(require("./routes/evaluations.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// Routes (suporta tanto /rota quanto /api/rota)
app.use(['/api/models', '/models'], models_routes_1.default);
app.use(['/api/settings', '/settings'], settings_routes_1.default);
app.use(['/api/parts', '/parts'], parts_routes_1.default);
app.use(['/api/evaluations', '/evaluations'], evaluations_routes_1.default);
app.get(['/api/health', '/health'], (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
exports.default = app;
