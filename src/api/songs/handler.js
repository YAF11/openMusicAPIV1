const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Mengikat semua metode kelas ke instance agar tetap mempertahankan konteksnya
    autoBind(this);
  }

  // Handler untuk menambahkan lagu baru
  async postSongHandler(request, h) {
    // Memvalidasi payload yang diterima
    this._validator.validateSongPayload(request.payload);
    const { title, year, genre, performer, duration, albumId } = request.payload;

    // Menambahkan lagu ke dalam database melalui service
    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });

    // Mengembalikan respons sukses dengan status 201 (Created)
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  // Handler untuk mendapatkan daftar semua lagu (dapat difilter berdasarkan judul atau penyanyi)
  async getSongsHandler(request) {
    const { title, performer } = request.query;

    // Mengambil daftar lagu dari service dengan filter opsional
    const songs = await this._service.getSongs({ title, performer });

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  // Handler untuk mendapatkan detail lagu berdasarkan ID
  async getSongByIdHandler(request) {
    const { id } = request.params;

    // Mengambil data lagu berdasarkan ID dari service
    const song = await this._service.getSongById(id);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  // Handler untuk memperbarui lagu berdasarkan ID
  async putSongByIdHandler(request) {
    // Memvalidasi payload yang diterima
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;

    // Memperbarui lagu di database
    await this._service.editSongById(id, request.payload);

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  // Handler untuk menghapus lagu berdasarkan ID
  async deleteSongByIdHandler(request) {
    const { id } = request.params;

    // Menghapus lagu dari database berdasarkan ID
    await this._service.deleteSongById(id);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
