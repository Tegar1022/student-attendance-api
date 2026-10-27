const db = require('../config/database');

// Catat absensi siswa
exports.inputAbsensi = (req, res) => {
  const { siswa_id, tanggal, keterangan } = req.body;

  if (!siswa_id || !tanggal || !keterangan) {
    return res.status(400).json({ status: false, message: 'siswa_id, tanggal, dan keterangan wajib diisi' });
  }

  const query = 'INSERT INTO absensi (siswa_id, tanggal, keterangan) VALUES (?, ?, ?)';
  db.run(query, [siswa_id, tanggal, keterangan], function (err) {
    if (err) {
      console.error('[absensi] insert error:', err.message);
      return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    res.status(201).json({
      status: true,
      message: 'Absensi berhasil dicatat',
      data: { id: this.lastID, siswa_id, tanggal, keterangan }
    });
  });
};

// Ambil laporan absensi (JOIN dengan tabel siswa)
exports.getLaporan = (req, res) => {
  const query = `
    SELECT 
      absensi.id,
      siswa.nis,
      siswa.nama,
      siswa.kelas,
      absensi.tanggal,
      absensi.keterangan
    FROM absensi
    JOIN siswa ON absensi.siswa_id = siswa.id
    ORDER BY absensi.tanggal DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('[absensi] report error:', err.message);
      return res.status(500).json({ status: false, message: 'Internal server error' });
    }
    res.json({ status: true, total: rows.length, data: rows });
  });
};