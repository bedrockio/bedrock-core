async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    let { status = 500, message, details } = err;

    if (err.isJoi) {
      message = details.map((d) => d.message).join("\n");
    }

    ctx.type = "json";
    ctx.status = status;
    ctx.body = {
      error: { message, status, details },
    };

    ctx.app.emit("error", err, ctx);
  }
}

module.exports = errorHandler;
