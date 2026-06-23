const express = require('express');

const app = express();
app.use(express.json());

const clientes = [
  { id: 1, nombre: 'Ana García',   email: 'ana@example.com'   },
  { id: 2, nombre: 'Luis Pérez',   email: 'luis@example.com'  },
  { id: 3, nombre: 'María López',  email: 'maria@example.com' },
];

app.get('/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cliente = clientes.find(c => c.id === id);

  if (!cliente) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }

  return res.status(200).json(cliente);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Servicio Clientes escuchando en puerto ${PORT}`);
});
