// --- DATA & STATE ---
// Sekarang courses menyimpan object: { name: string, sks: number }
let courses = []; 

const availableSlots = [
    "Senin 08:00 - 10:00", "Senin 10:00 - 12:00", "Senin 13:00 - 15:00",
    "Selasa 08:00 - 10:00", "Selasa 10:00 - 12:00",
    "Rabu 08:00 - 10:00", "Rabu 10:00 - 12:00", "Rabu 13:00 - 15:00",
    "Kamis 09:00 - 11:00", "Jumat 09:00 - 11:00"
];

// --- INIT ---
window.onload = function() {
    renderSlots();
};

// --- DOM FUNCTIONS ---

function handleEnter(e) {
    if(e.key === 'Enter') addCourse();
}

function renderSlots() {
    const list = document.getElementById('slotList');
    list.innerHTML = '';
    availableSlots.forEach(slot => {
        const li = document.createElement('li');
        li.textContent = slot;
        list.appendChild(li);
    });
    document.getElementById('slotCount').textContent = availableSlots.length;
}

function addCourse() {
    const nameInput = document.getElementById('courseInput');
    const sksInput = document.getElementById('sksInput');
    
    const name = nameInput.value.trim();
    const sks = parseInt(sksInput.value);

    // Validasi
    if (!name) return alert("Nama mata kuliah tidak boleh kosong");
    if (!sks || sks <= 0) return alert("SKS harus diisi angka lebih dari 0");
    
    // Cek duplikat nama
    if (courses.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        return alert("Mata kuliah sudah ada");
    }

    // Push Object ke Array
    courses.push({ name: name, sks: sks });
    
    nameInput.value = '';
    sksInput.value = '';
    nameInput.focus(); // Balikin kursor ke nama matkul biar cepat ngetik lagi
    
    renderCourses();
}

function removeCourse(index) {
    courses.splice(index, 1);
    renderCourses();
}

function renderCourses() {
    const list = document.getElementById('courseList');
    const countSpan = document.getElementById('courseCount');
    list.innerHTML = '';

    if (courses.length === 0) {
        list.innerHTML = `
            <li class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <span>Belum ada mata kuliah</span>
            </li>`;
    } else {
        courses.forEach((course, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <span class="badge-sks">${course.sks} SKS</span>
                    <span>${course.name}</span>
                </div>
                <button class="delete-btn" onclick="removeCourse(${index})">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            list.appendChild(li);
        });
    }
    countSpan.textContent = courses.length;
    
    // Sembunyikan hasil lama jika ada perubahan data
    document.getElementById('resultSection').classList.add('hidden');
}

// --- ALGORITMA BACKTRACKING (DENGAN PRIORITAS SKS) ---

function generateSchedule() {
    const resultSection = document.getElementById('resultSection');
    const statusBox = document.getElementById('statusMsg');
    const tbody = document.getElementById('resultBody');
    
    resultSection.classList.remove('hidden');
    tbody.innerHTML = ''; // Reset tabel

    // Validasi
    if (courses.length === 0) {
        statusBox.className = 'status-box error';
        statusBox.textContent = "Masukkan minimal satu mata kuliah.";
        return;
    }

    if (courses.length > availableSlots.length) {
        statusBox.className = 'status-box error';
        statusBox.textContent = `Gagal: Jumlah matkul (${courses.length}) melebihi slot tersedia (${availableSlots.length}).`;
        return;
    }

    // --- LOGIKA UTAMA: SORTING (HEURISTIC) ---
    // Kita buat salinan array agar urutan tampilan di daftar input tidak berubah acak
    // Urutkan Descending (SKS Besar ke Kecil)
    let sortedCourses = [...courses].sort((a, b) => b.sks - a.sks);

    // Persiapan Variabel
    let assignment = {}; // { "Nama Matkul": "Slot Waktu" }
    let usedSlots = new Set(); 

    // Eksekusi Algoritma dengan array yang sudah diurutkan
    const success = solveBacktracking(sortedCourses, 0, assignment, usedSlots);

    if (success) {
        statusBox.className = 'status-box success';
        statusBox.textContent = "Sukses! Jadwal disusun berdasarkan prioritas SKS tertinggi.";
        
        // Tampilkan hasil
        let rowNumber = 1;
        
        // Kita loop berdasarkan slot waktu agar tabel urut Senin -> Jumat
        availableSlots.forEach(slot => {
            // Cari nama matkul yang dapet slot ini
            const courseName = Object.keys(assignment).find(key => assignment[key] === slot);
            
            if (courseName) {
                // Ambil data SKS asli untuk ditampilkan
                const originalCourseData = courses.find(c => c.name === courseName);
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rowNumber++}</td>
                    <td>${slot}</td>
                    <td><strong>${courseName}</strong></td>
                    <td><span class="badge-sks">${originalCourseData.sks} SKS</span></td>
                `;
                tbody.appendChild(tr);
            }
        });

    } else {
        statusBox.className = 'status-box error';
        statusBox.textContent = "Gagal menyusun jadwal. Konflik tidak dapat diselesaikan.";
    }
}

/**
 * Fungsi Rekursif Backtracking
 * @param {Array} courseList - Daftar matkul yang SUDAH diurutkan SKS-nya
 */
function solveBacktracking(courseList, courseIdx, assignment, usedSlots) {
    // BASE CASE: Jika semua matkul sudah dapat slot
    if (courseIdx === courseList.length) {
        return true;
    }

    const currentCourseObj = courseList[courseIdx];
    const currentCourseName = currentCourseObj.name;

    // Iterasi Domain (Slot Waktu)
    for (let i = 0; i < availableSlots.length; i++) {
        const slot = availableSlots[i];

        // CONSTRAINT: Slot kosong?
        if (!usedSlots.has(slot)) {
            
            // ASSIGN
            assignment[currentCourseName] = slot;
            usedSlots.add(slot);

            // RECURSE
            if (solveBacktracking(courseList, courseIdx + 1, assignment, usedSlots)) {
                return true;
            }

            // BACKTRACK
            delete assignment[currentCourseName];
            usedSlots.delete(slot);
        }
    }

    return false;
}