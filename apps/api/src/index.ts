import { buildApp } from "./app.js";

const { app, config } = await buildApp();

try {
  await app.listen({ host: config.apiHost, port: config.apiPort });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
