// Mengimpor dotenv untuk membaca konfigurasi dari file .env
require('dotenv').config();

const Hapi = require('@hapi/hapi'); // Mengimpor framework Hapi.js
const ClientError = require('./exceptions/ClientError'); // Mengimpor kelas error khusus

// Mengimpor modul album dan lagu
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

const init = async () => {
  // Membuat instance service untuk album dan lagu
  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  // Membuat instance server Hapi dengan konfigurasi dari environment variables
  const server = Hapi.server({
    port: process.env.PORT, // Port diambil dari file .env
    host: process.env.HOST, // Host diambil dari file .env
    routes: {
      cors: {
        origin: ['*'], // Mengizinkan CORS dari semua domain
      },
    },
  });

  // Mendaftarkan plugin untuk album dan lagu
  await server.register([
    {
      plugin: albums, // Plugin untuk album
      options: {
        service: albumsService, // Service untuk menangani data album
        validator: AlbumsValidator, // Validator untuk validasi input album
      }
    },
    {
      plugin: songs, // Plugin untuk lagu
      options: {
        service: songsService, // Service untuk menangani data lagu
        validator: SongsValidator, // Validator untuk validasi input lagu
      },
    }
  ]);

  // Middleware untuk menangani error dari ClientError
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Jika error berasal dari ClientError, kembalikan response yang sesuai
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue; // Lanjutkan response jika tidak ada error
  });

  await server.start(); // Memulai server
  console.log(`Server berjalan pada ${server.info.uri}`); // Menampilkan informasi server yang berjalan
};

// Menjalankan fungsi init untuk memulai server
init();
