const {io} = require("socket.io-client");
let socket;

export default (app, inject) => {
  inject("websocket", {
    createConnection() {
      socket = io(app.$config.SOCKET_URL, {
        query     : `token=${app.$auth.strategy.token.get().split(' ')[1]}`,
        transports: ['websocket']
      });

      socket.on('userConnect', (message) => {
        if (!message.status) {
          socket.destroy();
          app.store.commit('system/setSocketConnectError',true);
        } else {
          app.store.commit('system/setSocketConnectError',false);
        }
      });
    },
    destroyConnection() {
      if (socket !== undefined) {
        socket.destroy();
      }
    },
    getSocket() {
      return socket;
    }
  });
};
