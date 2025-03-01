const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { Pool } = require('pg');
const { mapSongToDBModel } = require('../../utils');

class AlbumsService {
  constructor() {
    // Membuat instance koneksi pool ke database PostgreSQL
    this._pool = new Pool();
  }

  // Fungsi untuk menambahkan album baru ke database
  async addAlbum({ name, year }) {
    const id = nanoid(16); // Membuat ID unik dengan nanoid

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    // Jika album gagal ditambahkan, lemparkan error
    if (!result.rows[0]?.id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  // Fungsi untuk mendapatkan album berdasarkan ID
  async getAlbumById(id) {
    const query = {
      text: `
        SELECT 
          albums.id, 
          albums.name, 
          albums.year
        FROM albums 
        WHERE albums.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    // Jika album tidak ditemukan, lemparkan error
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    // Mengambil daftar lagu yang terkait dengan album berdasarkan albumId
    const songQuery = {
      text: `SELECT id, title, performer
             FROM songs WHERE "albumId" = $1`,
      values: [id],
    };

    const songResult = await this._pool.query(songQuery);
    const songs = songResult.rows.map(mapSongToDBModel);

    return {
      ...result.rows[0], // Data album
      songs, // Data lagu-lagu yang termasuk dalam album
    };
  }

  // Fungsi untuk memperbarui album berdasarkan ID
  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this._pool.query(query);

    // Jika album tidak ditemukan, lemparkan error
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  // Fungsi untuk menghapus album berdasarkan ID
  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    // Jika album tidak ditemukan, lemparkan error
    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
