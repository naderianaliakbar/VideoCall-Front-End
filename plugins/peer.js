import Peer from "peerjs";

let peerConnection;
let peerId;

export default (app, inject) => {
  inject("peer", {
    connect() {
      let peerConnectionConfig = {
        host  : app.$config.PEER_URL,
        token : app.$auth.strategy.token.get().split(' ')[1],
        secure: true,
        // iceTransportPolicy: 'relay',
        // iceServers        : [
        //   {
        //     urls      : 'turn:turn.exoroya.ir',
        //     credential: '123',
        //     username  : 'abc'
        //   },
        // ]
      }
      peerConnection           = new Peer(peerConnectionConfig);
      peerConnection.on('open', (id) => {
        peerId = id;
      });
    },
    getPeer() {
      return peerConnection;
    },
    getPeerId() {
      return peerId;
    },
    destroy() {
      peerConnection.destroy();
    }
  })
};
