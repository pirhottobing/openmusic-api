const UploadsHandler = require('./handler');
const routes = require('./routes');
const AlbumsService = require('../../services/postgres/AlbumsService');

const albumsService = new AlbumsService();

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const uploadsHandler = new UploadsHandler(service, validator, albumsService);
    server.route(routes(uploadsHandler));
  },
};
