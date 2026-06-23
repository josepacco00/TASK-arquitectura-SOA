/**
 * Router del Bus de Servicios (Mini ESB).
 *
 * Define las tres rutas expuestas por el Bus:
 *   - POST /pedido       → orquestador crearPedido
 *   - GET  /clientes/:id → proxy a Servicio_Clientes
 *   - GET  /stock/:id    → proxy a Servicio_Inventario
 *
 * Requisitos: 1.1, 2.4, 8.2, 9.4
 */

const { Router } = require('express');
const fetch      = require('node-fetch');
const { crearPedido } = require('../orchestrator/pedido');

const CLIENTES_URL   = process.env.CLIENTES_URL   || 'http://clientes:4001';
const INVENTARIO_URL = process.env.INVENTARIO_URL || 'http://inventario:4002';

const router = Router();

// ── POST /pedido ─────────────────────────────────────────────────────────────
// Delega al orquestador que implementa el pipeline completo — Requisito 8.2
router.post('/pedido', crearPedido);

// ── GET /clientes/:id ─────────────────────────────────────────────────────────
// Proxy directo a Servicio_Clientes — Requisitos 1.1, 9.4
router.get('/clientes/:id', async (req, res) => {
  let serviceRes;
  try {
    serviceRes = await fetch(`${CLIENTES_URL}/clientes/${req.params.id}`);
  } catch (err) {
    return res.status(502).json({ error: 'Error en servicio clientes' });
  }

  const body = await serviceRes.text();
  res.status(serviceRes.status);

  // Propagar el Content-Type para que el cliente reciba JSON correctamente
  const contentType = serviceRes.headers.get('content-type');
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }

  return res.send(body);
});

// ── GET /stock/:id ────────────────────────────────────────────────────────────
// Proxy directo a Servicio_Inventario — Requisitos 1.1, 9.4
router.get('/stock/:id', async (req, res) => {
  let serviceRes;
  try {
    serviceRes = await fetch(`${INVENTARIO_URL}/stock/${req.params.id}`);
  } catch (err) {
    return res.status(502).json({ error: 'Error en servicio inventario' });
  }

  const body = await serviceRes.text();
  res.status(serviceRes.status);

  const contentType = serviceRes.headers.get('content-type');
  if (contentType) {
    res.setHeader('Content-Type', contentType);
  }

  return res.send(body);
});

module.exports = router;
