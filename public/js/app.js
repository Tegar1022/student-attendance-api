const state = {
  students: [],
  attendanceLogs: [],
  searchQuery: '',
  statusFilter: 'ALL'
};

// DOM Elements
const studentForm = document.getElementById('studentForm');
const attendanceForm = document.getElementById('attendanceForm');
const studentTableBody = document.getElementById('studentTableBody');
const attendanceTableBody = document.getElementById('attendanceTableBody');
const selectStudent = document.getElementById('selectStudent');
const searchStudentInput = document.getElementById('searchStudent');
const filterStatusSelect = document.getElementById('filterStatus');

// Set default date ke hari ini
document.getElementById('inputDate').valueAsDate = new Date();

// Helper: Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  const prefix = type === 'error' ? '[ERR]' : '[OK]';
  toast.textContent = `${prefix} ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

// 1. Fetch Data Siswa dari GET /api/students
async function fetchStudents() {
  try {
    const res = await fetch('/api/students');
    const json = await res.json();
    if (json.status) {
      state.students = json.data || [];
      renderStudents();
      populateStudentSelect();
      updateMetrics();
    }
  } catch (err) {
    showToast('Gagal memuat direktori siswa', 'error');
  }
}

// 2. Fetch Laporan Absensi dari GET /api/attendance/report
async function fetchAttendanceReport() {
  try {
    const res = await fetch('/api/attendance/report');
    const json = await res.json();
    if (json.status) {
      state.attendanceLogs = json.data || [];
      renderAttendanceLogs();
      updateMetrics();
    }
  } catch (err) {
    showToast('Gagal memuat log presensi', 'error');
  }
}

// 3. Render Tabel Siswa + Live Search
function renderStudents() {
  const query = state.searchQuery.toLowerCase().trim();
  const filtered = state.students.filter(s =>
    s.nis.toLowerCase().includes(query) ||
    s.nama.toLowerCase().includes(query) ||
    s.kelas.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    studentTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">NO_RECORDS_FOUND // Belum ada data siswa yang cocok</td>
      </tr>
    `;
    return;
  }

  studentTableBody.innerHTML = filtered.map(s => `
    <tr>
      <td class="cell-mono">#${s.id}</td>
      <td class="cell-mono">${escapeHtml(s.nis)}</td>
      <td class="cell-primary">${escapeHtml(s.nama)}</td>
      <td>${escapeHtml(s.kelas)}</td>
      <td style="text-align: right;">
        <button class="btn-delete" onclick="deleteStudent(${s.id}, '${escapeHtml(s.nama)}')">
          DELETE
        </button>
      </td>
    </tr>
  `).join('');
}

// 4. Render Dropdown Pilihan Siswa
function populateStudentSelect() {
  if (state.students.length === 0) {
    selectStudent.innerHTML = '<option value="">-- Tambahkan siswa terlebih dahulu --</option>';
    return;
  }

  selectStudent.innerHTML = '<option value="">-- Pilih Siswa --</option>' +
    state.students.map(s => `
      <option value="${s.id}">${escapeHtml(s.nis)} — ${escapeHtml(s.nama)} (${escapeHtml(s.kelas)})</option>
    `).join('');
}

// 5. Render Tabel Log Presensi + Filter Status
function renderAttendanceLogs() {
  const filtered = state.attendanceLogs.filter(item =>
    state.statusFilter === 'ALL' ? true : item.keterangan === state.statusFilter
  );

  if (filtered.length === 0) {
    attendanceTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">NO_LOGS_AVAILABLE // Belum ada riwayat presensi</td>
      </tr>
    `;
    return;
  }

  attendanceTableBody.innerHTML = filtered.map(r => `
    <tr>
      <td class="cell-mono">${escapeHtml(r.tanggal)}</td>
      <td class="cell-mono">${escapeHtml(r.nis)}</td>
      <td class="cell-primary">${escapeHtml(r.nama)}</td>
      <td>${escapeHtml(r.kelas)}</td>
      <td>
        <span class="badge badge-${escapeHtml(r.keterangan)}">
          ${escapeHtml(r.keterangan)}
        </span>
      </td>
    </tr>
  `).join('');
}

// 6. Update Statistik KPI di Header Atas
function updateMetrics() {
  const totalStudents = state.students.length;
  const totalLogs = state.attendanceLogs.length;
  const hadirCount = state.attendanceLogs.filter(l => l.keterangan === 'HADIR').length;
  const alfaCount = state.attendanceLogs.filter(l => l.keterangan === 'ALFA').length;
  const rate = totalLogs > 0 ? Math.round((hadirCount / totalLogs) * 100) : 0;

  document.getElementById('statTotalStudents').textContent = totalStudents;
  document.getElementById('statTotalLogs').textContent = totalLogs;
  document.getElementById('statAttendanceRate').textContent = `${rate}%`;
  document.getElementById('statTotalAlfa').textContent = alfaCount;
}

// 7. Submit Siswa Baru (POST /api/students)
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    nis: document.getElementById('inputNis').value.trim(),
    nama: document.getElementById('inputNama').value.trim(),
    kelas: document.getElementById('inputKelas').value.trim()
  };

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (res.ok && json.status) {
      showToast(`Siswa "${payload.nama}" berhasil ditambahkan`);
      studentForm.reset();
      fetchStudents();
    } else {
      showToast(json.message || 'Gagal menyimpan data siswa', 'error');
    }
  } catch (err) {
    showToast('Kesalahan jaringan ke server', 'error');
  }
});

// 8. Submit Presensi Harian (POST /api/attendance)
attendanceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    siswa_id: Number(document.getElementById('selectStudent').value),
    tanggal: document.getElementById('inputDate').value,
    keterangan: document.getElementById('selectStatus').value
  };

  if (!payload.siswa_id) {
    showToast('Pilih siswa terlebih dahulu', 'error');
    return;
  }

  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();

    if (res.ok && json.status) {
      showToast(`Presensi [${payload.keterangan}] berhasil dicatat`);
      fetchAttendanceReport();
    } else {
      showToast(json.message || 'Gagal mencatat presensi', 'error');
    }
  } catch (err) {
    showToast('Kesalahan jaringan ke server', 'error');
  }
});

// 9. Hapus Siswa (DELETE /api/students/:id)
async function deleteStudent(id, nama) {
  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const json = await res.json();

    if (res.ok && json.status) {
      showToast(`Data "${nama}" telah dihapus`);
      fetchStudents();
      fetchAttendanceReport();
    } else {
      showToast(json.message || 'Gagal menghapus siswa', 'error');
    }
  } catch (err) {
    showToast('Gagal menghubungi server', 'error');
  }
}

// Event Listeners untuk Pencarian & Filter
searchStudentInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  renderStudents();
});

filterStatusSelect.addEventListener('change', (e) => {
  state.statusFilter = e.target.value;
  renderAttendanceLogs();
});

// Helper XSS Sanitizer
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inisialisasi saat halaman dimuat
fetchStudents();
fetchAttendanceReport();