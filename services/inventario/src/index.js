const express = require('express');

const app = express();
app.use(express.json());

const productos = [
  { producto_id: 100, nombre: 'Laptop',  stock: 10 },
  { producto_id: 101, nombre: 'Mouse',   stock: 5  },
  { producto_id: 102, nombre: 'Teclado', stock: 0  },
];

app.get('/stock/:id', (req, res) => {
  const idRaw = req.params.id;

  // Validate that :id is a valid integer (no decimals, no non-numeric chars)
  if (!/^\d+$/.test(idRaw)) {
    return res.status(400).json({ error: 'ID de producto inválido' });
  }

  const id = parseInt(idRaw, 10);
  const producto = productos.find(p => p.producto_id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  return res.status(200).json({
    producto_id: producto.producto_id,
    nombre: producto.nombre,
    stock: producto.stock,
  });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`Servicio Inventario escuchando en puerto ${PORT}`);
});
