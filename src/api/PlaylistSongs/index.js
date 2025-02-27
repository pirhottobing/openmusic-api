const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');
const SongsService = require('../../services/postgres/SongsService');
const PlaylistsService = require('../../services/postgres/PlaylistsService');

const songsService = new SongsService();
const playlistsService = new PlaylistsService();

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
      service,
      validator,
      songsService,
      playlistsService,
    );
    server.route(routes(playlistSongsHandler));
  },
};