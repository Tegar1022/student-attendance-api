const db = require('../config/database');

// Ambil semua data siswa
exports.getSiswa = (req, res) => {
  const query = 'SELECT * FROM siswa ORDER BY id DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('[siswa] get error:', err.message);
      return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    res.json({ status: true, data: rows });
  });
};

// Tambah siswa baru
exports.addSiswa = (req, res) => {
  const { nis, nama, kelas } = req.body;

  if (!nis || !nama || !kelas) {
    return res.status(400).json({ status: false, message: 'nis, nama, dan kelas wajib diisi' });
  }

  const query = 'INSERT INTO siswa (nis, nama, kelas) VALUES (?, ?, ?)';
  db.run(query, [nis, nama, kelas], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ status: false, message: 'NIS sudah terdaftar' });
      }
      console.error('[siswa] insert error:', err.message);
      return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    res.status(201).json({
      status: true,
      message: 'Siswa berhasil ditambahkan',
      data: { id: this.lastID, nis, nama, kelas }
    });
  });
};

// Hapus siswa berdasarkan ID
exports.deleteSiswa = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM siswa WHERE id = ?';

  db.run(query, id, function (err) {
    if (err) {
      console.error('[siswa] delete error:', err.message);
      return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ status: false, message: 'Data siswa tidak ditemukan' });
    }
    res.json({ status: true, message: `Data siswa ID ${id} berhasil dihapus` });
  });
};