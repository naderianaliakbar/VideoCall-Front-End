const {io} = require("socket.io-client");
let socket;

export default (app, inject) => {
  inject("websocket", {
    createConnection() {
      socket = io('http://localhost:5000', {
        query     : `token=${app.$auth.strategy.token.get().split(' ')[1]}`,
        transports: ['websocket']
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
