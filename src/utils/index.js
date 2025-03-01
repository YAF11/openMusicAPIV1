const mapAlbumToDBModel = ({
  id, name, year, created_at: createdAt, updated_at: updatedAt,
}) => ({
  id, name, year, createdAt, updatedAt,
});

const mapSongToDBModel = ({
  id, title, year, genre, performer, duration, albumId, created_at: createdAt,
  updated_at: updatedAt,
}) => ({
  id, title, year, genre, performer, duration, albumId, createdAt, updatedAt,
});


module.exports = { mapAlbumToDBModel, mapSongToDBModel };