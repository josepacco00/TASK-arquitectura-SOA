const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const pedidos = [];

app.post('/pedido', (req, res) => {
  const { cliente_id, producto_id } = req.body || {};

  if (cliente_id === undefined || cliente_id === null ||
      producto_id === undefined || producto_id === null) {
    return res.status(400).json({ error: 'cliente_id y producto_id son requeridos' });
  }

  const pedido = {
    pedido_id: uuidv4(),
    cliente_id,
    producto_id,
    timestamp: new Date().toISOString(),
  };

  pedidos.push(pedido);

  return res.status(201).json(pedido);
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`Servicio Pedidos escuchando en puerto ${PORT}`);
});
