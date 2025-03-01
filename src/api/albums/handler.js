const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      const albumId = await this._service.addAlbum({ name, year });

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getAlbumsHandler(h) {
    try {
      const albums = await this._service.getAlbums();
      return {
        status: 'success',
        data: {
          albums,
        },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      return {
        status: 'success',
        message: 'Data album sukses diambil',
        data: {
          album,
        },
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;

      await this._service.editAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Album sukses diperbarui',
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);

      return {
        status: 'success',
        message: 'Album berhasil dihapus',
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  _handleError(error, h) {
    if (error instanceof ClientError) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }

    console.error(error);
    const response = h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    });
    response.code(500);
    return response;
  }
}

module.exports = AlbumsHandler;