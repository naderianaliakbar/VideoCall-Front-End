let DetectRTC = require('detectrtc');

export default (app, inject) => {
  inject("detectRTC", {
    get() {
      return DetectRTC;
    },
  })
};
