const mapAlbums = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
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

const UserMap = ({
  id, username, password, fullname,
}) => ({
  id,
  username,
  password,
  fullname,
});

module.exports = { mapAlbums, mapSongs, UserMap };
