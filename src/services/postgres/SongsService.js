const { Pool } = require('pg'); // Menggunakan PostgreSQL sebagai database
const { nanoid } = require('nanoid'); // Library untuk membuat ID unik
const InvariantError = require('../../exceptions/InvariantError');
const { mapSongToDBModel } = require('../../utils/index');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    // Membuat koneksi ke database menggunakan Pool dari pg
    this._pool = new Pool();
  }

  // Fungsi untuk menambahkan lagu baru ke database
  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`; // Membuat ID unik untuk lagu

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    // Jika lagu gagal ditambahkan, lemparkan error
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id; // Mengembalikan ID lagu yang baru ditambahkan
  }

  // Fungsi untuk mendapatkan daftar lagu berdasarkan filter judul dan penyanyi
  async getSongs({ title, performer }) {
    let query;

    // Jika ada filter untuk title dan performer
    if (title && performer) {
      query = `SELECT id, title, performer FROM songs 
               WHERE LOWER(title) LIKE '%${title}%' 
               AND LOWER(performer) LIKE '%${performer}%'`;
    }
    // Jika hanya ada filter title atau performer
    else if (title || performer) {
      query = `SELECT id, title, performer FROM songs 
               WHERE LOWER(title) LIKE '%${title}%' 
               OR LOWER(performer) LIKE '%${performer}%'`;
    }
    // Jika tidak ada filter, ambil semua lagu
    else {
      query = 'SELECT id, title, performer FROM songs';
    }

    const result = await this._pool.query(query);
    return result.rows.map(mapSongToDBModel); // Mengembalikan hasil yang telah dipetakan ke model
  }

  // Fungsi untuk mendapatkan lagu berdasarkan ID
  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    // Jika lagu tidak ditemukan, lemparkan error
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapSongToDBModel)[0]; // Mengembalikan data lagu pertama yang ditemukan
  }

  // Fungsi untuk memperbarui lagu berdasarkan ID
  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: `UPDATE songs 
             SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 
             WHERE id = $7 
             RETURNING id`,
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    // Jika lagu tidak ditemukan, lemparkan error
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
    }
  }

  // Fungsi untuk menghapus lagu berdasarkan ID
  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    // Jika lagu tidak ditemukan, lemparkan error
    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
