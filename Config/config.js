const config = {
  bots: [],
  // botName y _botTarget son controlados desde el modal del panel.
  // Se sobreescriben en runtime — NO los cambies aquí.
  botName: ["Bot"],   // valor inicial, el modal lo reemplaza al arrancar
  _botTarget: 10,     // cantidad inicial, el modal lo reemplaza al arrancar
  botAi: true,        // true=AI, false=Follow mouse
  serverSettings: {
    port: 80,
    useSSL: false,
  },
  proxySettings: {
    scrape: false,
    timeout: 7000,
    protocol: "http",
    enableProxy: false,
  },
};

export default config;