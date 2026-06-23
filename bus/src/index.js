/**
 * Punto de entrada del Bus de Servicios (Mini ESB).
 *
 * Pipeline de procesamiento:
 *   1. express.json()  — parsear cuerpo JSON de las solicitudes
 *   2. auth            — validar Bearer token (primer middleware)
 *   3. audit           — generar request_id y emitir logs JSON (segundo middleware)
 *   4. router          — delegar a la ruta correspondiente
 *
 * Requisitos: 1.1, 2.4, 3.1, 8.2, 9.4
 */

const express = require('express');
const auth    = require('./middleware/auth');
const audit   = require('./middleware/audit');
const router  = require('./routes/router');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware globales ───────────────────────────────────────────────────────
app.use(express.json());   // parsear JSON
app.use(auth);             // autenticación primero  — Requisito 2.4
app.use(audit);            // auditoría segundo      — Requisito 3.1

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use('/', router);

// ── Inicio del servidor ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(JSON.stringify({
    event:   'BUS_STARTED',
    port:    PORT,
    timestamp: new Date().toISOString(),
  }));
});

module.exports = app; // exportar para facilitar pruebas
