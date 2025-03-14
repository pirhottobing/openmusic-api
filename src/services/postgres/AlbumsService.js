const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapAlbums } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongs } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan lagu');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id =$1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const album = result.rows.map(mapAlbums)[0];

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [album.id],
    };
    const songsResult = await this._pool.query(songsQuery);

    const songs = songsResult.rows.map(mapSongs);

    const response = {
      ...album,
      songs,
    };
    return response;
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id =$3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
  }

  async editCoverAlbumById(albumId, url) {
    const query = {
      text: 'UPDATE albums SET "coverUrl" = $1 WHERE id = $2',
      values: [url, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Cover Album gagal diperbarui. Id tidak ditemukan');
    }
  }

  async validateLikeAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return false;
    }
    return true;
  }

  async addAlbumLike(userId, albumId) {
    const id = `like-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }
    await this._cacheService.delete(`likes:${albumId}`);
    return result.rows[0].id;
  }

  async getAlbumLikes(id) {
    try {
      const customHeader = 'cache';
      const likes = await this._cacheService.get(`likes:${id}`);
      return { customHeader, likes: +likes };
    } catch (error) {
      await this.getAlbumById(id);

      const customHeader = 'server';
      const query = {
        text: 'SELECT * FROM album_likes WHERE album_id = $1',
        values: [id],
      };

      const result = await this._pool.query(query);
      const likes = result.rowCount;
      await this._cacheService.set(`likes:${id}`, likes);
      return { customHeader, likes };
    }
  }

  async deleteAlbumLike(id, userId) {
    await this.getAlbumById(id);
    const query = {
      text: 'DELETE FROM album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Id tidak ditemukan');
    }
    await this._cacheService.delete(`likes:${id}`);
  }
}

module.exports = AlbumsService;
