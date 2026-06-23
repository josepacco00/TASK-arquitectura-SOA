/**
 * Middleware de auditoría del Bus.
 *
 * Se ejecuta DESPUÉS del middleware de autenticación, por lo que el token
 * ya ha sido validado cuando este middleware corre.
 *
 * - Genera un request_id único (UUID v4) por solicitud.
 * - Emite a stdout un log JSON de inicio (REQUEST_START) con campos:
 *     event, request_id, timestamp, method, path, user
 * - Adjunta request_id a res.locals para correlacionar inicio y fin.
 * - Registra el evento "finish" del response para emitir el log de fin
 *     (REQUEST_END) con: event, request_id, status.
 * - Llama next() para continuar el pipeline.
 *
 * Requisitos: 3.1, 3.2, 3.3, 3.4
 */

const { v4: uuidv4 } = require('uuid');

function audit(req, res, next) {
  const request_id = uuidv4();
  const timestamp  = new Date().toISOString();
  const method     = req.method;
  const path       = req.path;

  // Extraer el identificador del usuario quitando el prefijo "Bearer "
  const authHeader = req.headers['authorization'] || '';
  const user = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Emitir log de inicio — Requisito 3.1
  console.log(JSON.stringify({
    event: 'REQUEST_START',
    request_id,
    timestamp,
    method,
    path,
    user,
  }));

  // Adjuntar request_id a res.locals para usarlo en el log de fin — Requisito 3.2
  res.locals.request_id = request_id;

  // Registrar log de fin cuando la respuesta se complete — Requisito 3.2, 3.3
  res.on('finish', () => {
    console.log(JSON.stringify({
      event:      'REQUEST_END',
      request_id: res.locals.request_id,
      status:     res.statusCode,
    }));
  });

  next();
}

module.exports = audit;
