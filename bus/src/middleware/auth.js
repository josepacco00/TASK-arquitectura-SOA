/**
 * Middleware de autenticación del Bus.
 *
 * Evalúa el encabezado Authorization como primer paso del pipeline,
 * antes de registrar cualquier Log de Auditoría o invocar cualquier servicio.
 *
 * Requisitos: 2.1, 2.2, 2.3, 2.4
 */

const VALID_TOKEN = `Bearer ${process.env.VALID_TOKEN || 'token-secreto-123'}`;

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Requisito 2.1: encabezado ausente → 401 "Token requerido"
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Requisito 2.2: valor distinto del token válido → 401 "Token inválido"
  if (authHeader !== VALID_TOKEN) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Requisito 2.3: token válido → continúa el pipeline
  next();
}

module.exports = auth;
