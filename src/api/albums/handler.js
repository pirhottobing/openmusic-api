class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getikeHandler = this.getLikeHandler.bind(this);
    this.deleteLikeHandler = this.deleteLikeHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan album',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui album',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Berhasil menghapus album',
    };
  }

  async postLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.getAlbumById(albumId);

    const alreadyLiked = await this._service.validateLikeAlbum(userId, albumId);
    if (!alreadyLiked) {
      await this._service.addAlbumLike(userId, albumId);
    } else {
      const response = h.response({
        status: 'fail',
        message: 'Hanya bisa sekali untuk menyukai album',
      });
      response.code(400);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async getLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { customHeader, likes } = await this._service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', customHeader);
    response.code(200);
    return response;
  }

  async deleteLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.deleteAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menghapus suka dari album',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;
