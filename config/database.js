const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../sekolah.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[db] connection error:', err.message);
  } else {
    console.log('[db] sqlite connected: sekolah.db');
  }
});

db.serialize(() => {
  // Tabel Siswa
  db.run(`
    CREATE TABLE IF NOT EXISTS siswa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nis TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      kelas TEXT NOT NULL
    )
  `);

  // Tabel Absensi
  db.run(`
    CREATE TABLE IF NOT EXISTS absensi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      siswa_id INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      keterangan TEXT NOT NULL,
      FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;