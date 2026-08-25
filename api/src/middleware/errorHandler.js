/** 404 handler */
export function notFound(req, res) {
  res.status(404).json({ code: 404, msg: `接口不存在: ${req.method} ${req.path}`, data: null })
}

/** 全局错误处理 */
export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message)
  const status = err.status || 500
  const msg = err.message || '服务器内部错误'
  res.status(status).json({ code: status, msg, data: null })
}

/** 统一成功响应 */
export function success(res, data, msg = 'ok') {
  res.json({ code: 200, msg, data })
}

/** 统一失败响应 */
export function fail(res, msg, status = 400) {
  res.status(status).json({ code: status, msg, data: null })
}
