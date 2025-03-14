const mapAlbums = ({
  id,
  name,
  year,
  coverUrl,
}) => ({
  id,
  name,
  year,
  coverUrl,
});

const mapSongs = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

module.exports = { mapAlbums, mapSongs };
