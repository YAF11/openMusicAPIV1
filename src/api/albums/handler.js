const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Mengikat semua metode kelas ke instance ini agar tetap mempertahankan konteksnya
    autoBind(this);
  }

  // Handler untuk menambahkan album baru
  async postAlbumHandler(request, h) {
    try {
      // Memvalidasi payload yang diterima
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;

      // Menambahkan album ke dalam database melalui service
      const albumId = await this._service.addAlbum({ name, year });

      // Mengembalikan respons sukses dengan status 201 (Created)
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

  // Handler untuk mendapatkan daftar semua album
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

  // Handler untuk mendapatkan detail album berdasarkan ID
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

  // Handler untuk memperbarui album berdasarkan ID
  async putAlbumByIdHandler(request, h) {
    try {
      // Memvalidasi payload yang diterima
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;

      // Memperbarui album di database
      await this._service.editAlbumById(id, request.payload);

      return {
        status: 'success',
        message: 'Album sukses diperbarui',
      };
    } catch (error) {
      return this._handleError(error, h);
    }
  }

  // Handler untuk menghapus album berdasarkan ID
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

  // Metode untuk menangani error yang terjadi
  _handleError(error, h) {
    if (error instanceof ClientError) {
      // Jika error berasal dari kesalahan pengguna (ClientError), kembalikan respons sesuai status kode error
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(error.statusCode);
      return response;
    }

    // Jika terjadi error pada server, log error dan kembalikan pesan error dengan status 500
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
