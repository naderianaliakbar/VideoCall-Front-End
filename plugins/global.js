import mime from "mime";

export default (app, inject) => {
  inject("global", {
    getMime() {
      return mime;
    }
  });
};
