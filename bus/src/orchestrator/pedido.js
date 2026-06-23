/**
 * Orquestador del flujo de creación de pedido.
 *
 * Implementa el pipeline secuencial SOA:
 *   1. Extraer parámetros del body
 *   2. Validar cliente (Servicio_Clientes)
 *   3. Validar stock (Servicio_Inventario)
 *   4. Registrar pedido (Servicio_Pedidos)
 *   5. Responder 201 con el body de Servicio_Pedidos
 *
 * Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 9.5, 9.6
 */

const fetch = require('node-fetch');

const CLIENTES_URL   = process.env.CLIENTES_URL   || 'http://clientes:4001';
const INVENTARIO_URL = process.env.INVENTARIO_URL || 'http://inventario:4002';
const PEDIDOS_URL    = process.env.PEDIDOS_URL    || 'http://pedidos:4003';

/**
 * Handler para POST /pedido.
 * Orquesta la validación de cliente, inventario y registro de pedido.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
async function crearPedido(req, res) {
  const { cliente_id, producto_id } = req.body;
  const cantidad = req.body.cantidad !== undefined ? req.body.cantidad : 1;

  // ── Paso 1: Validar cliente ──────────────────────────────────────────────
  // Requisitos 7.2, 7.3
  let clienteRes;
  try {
    clienteRes = await fetch(`${CLIENTES_URL}/clientes/${cliente_id}`);
  } catch (err) {
    // Error de red (ECONNREFUSED, timeout, etc.) — Requisitos 9.5, 9.6
    return res.status(502).json({ error: 'Error en servicio clientes' });
  }

  if (clienteRes.status === 404) {
    // Requisito 7.3: cliente no encontrado → 404
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  if (!clienteRes.ok) {
    // Respuesta 5xx u otro error del servicio clientes — Requisito 7.6
    return res.status(502).json({ error: 'Error en servicio clientes' });
  }

  // ── Paso 2: Validar stock ────────────────────────────────────────────────
  // Requisitos 7.2, 7.4, 7.7
  let inventarioRes;
  try {
    inventarioRes = await fetch(`${INVENTARIO_URL}/stock/${producto_id}`);
  } catch (err) {
    // Error de red — Requisitos 9.5, 9.6
    return res.status(502).json({ error: 'Error en servicio inventario' });
  }

  if (!inventarioRes.ok) {
    // 404 u otro error del servicio inventario — Requisito 7.6
    if (inventarioRes.status >= 500) {
      return res.status(502).json({ error: 'Error en servicio inventario' });
    }
    // 404: producto no encontrado — tratar como error de negocio
    return res.status(inventarioRes.status).json(await inventarioRes.json());
  }

  let inventarioData;
  try {
    inventarioData = await inventarioRes.json();
  } catch (err) {
    return res.status(502).json({ error: 'Error en servicio inventario' });
  }

  const stock = inventarioData.stock;

  if (stock === 0) {
    // Requisito 7.4: sin stock → 409
    return res.status(409).json({ error: 'Sin stock disponible' });
  }

  if (cantidad > stock) {
    // Requisito 7.7: cantidad supera el stock disponible → 409
    return res.status(409).json({ error: 'Stock insuficiente' });
  }

  // ── Paso 3: Registrar pedido ─────────────────────────────────────────────
  // Requisitos 7.2, 7.5, 7.6
  let pedidoRes;
  try {
    pedidoRes = await fetch(`${PEDIDOS_URL}/pedido`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cliente_id, producto_id }),
    });
  } catch (err) {
    // Error de red — Requisitos 9.5, 9.6
    return res.status(502).json({ error: 'Error en servicio pedidos' });
  }

  if (pedidoRes.status >= 500) {
    // Requisito 7.6: respuesta 5xx del servicio pedidos → 502
    return res.status(502).json({ error: 'Error en servicio pedidos' });
  }

  let pedidoData;
  try {
    pedidoData = await pedidoRes.json();
  } catch (err) {
    return res.status(502).json({ error: 'Error en servicio pedidos' });
  }

  // Requisito 7.5: todo OK → 201 con el body de Servicio_Pedidos
  return res.status(201).json(pedidoData);
}

module.exports = { crearPedido };
