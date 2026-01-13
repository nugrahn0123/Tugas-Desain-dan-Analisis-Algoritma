const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";

async function searchGoogleBooks() {
    // 1. Ambil nilai input
    const inputVal = document.getElementById('searchInput').value;
    const container = document.getElementById('resultList');
    const statusMsg = document.getElementById('statusMsg');

    if (!inputVal) {
        alert("Silakan ketik judul buku terlebih dahulu!");
        return;
    }

    // Tampilkan loading
    statusMsg.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sedang mencari di Google...';
    container.innerHTML = ""; 

    try {
        // 2. Request ke API
        const response = await fetch(API_URL + inputVal.replace(/\s/g, "+"));
        const data = await response.json();

        // 3. Cek hasil
        if (data.totalItems === 0 || !data.items) {
            statusMsg.innerText = "Tidak ditemukan buku dengan kata kunci tersebut.";
            return;
        }

        statusMsg.innerText = `Ditemukan sekitar ${data.totalItems} hasil. Menampilkan 10 teratas.`;

        // 4. Render Hasil
        data.items.forEach(item => {
            const info = item.volumeInfo;
            
            // Ambil data mentah
            let title = info.title || "Tanpa Judul";
            let authors = info.authors ? info.authors.join(", ") : "Penulis Tidak Diketahui";
            let description = info.description || "Tidak ada deskripsi tersedia.";
            
            // --- BAGIAN UTAMA: HIGHLIGHTING ---
            // Kita ubah teks mentah menjadi HTML yang ada stabilo-nya
            title = highlightText(title, inputVal);
            authors = highlightText(authors, inputVal);
            description = highlightText(description, inputVal);
            // ----------------------------------

            // Cek gambar cover
            let coverImg = "https://via.placeholder.com/128x192?text=No+Cover";
            if (info.imageLinks && info.imageLinks.thumbnail) {
                coverImg = info.imageLinks.thumbnail;
            }

            // Buat HTML Kartu
            const card = document.createElement('div');
            card.className = "book-card";
            card.innerHTML = `
                <img src="${coverImg}" alt="Cover" class="book-cover">
                <div class="book-info">
                    <div class="book-title">${title}</div>
                    <div class="book-author"><i class="fa-solid fa-pen-nib"></i> ${authors}</div>
                    <div class="book-desc">${description}</div>
                    <a href="${info.previewLink}" target="_blank" class="btn-preview">Lihat di Google Books</a>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        statusMsg.innerText = "Terjadi kesalahan saat mengambil data.";
    }
}

// --- FUNGSI PEMBANTU UNTUK STABILLO ---
function highlightText(text, keyword) {
    // Jika teks kosong, kembalikan string kosong
    if (!text) return "";
    
    // Jika keyword kosong, kembalikan teks asli
    if (!keyword) return text;

    // Buat Regular Expression:
    // 'gi' artinya:
    // g = global (cari semua kemunculan, bukan cuma yang pertama)
    // i = case insensitive (huruf besar/kecil dianggap sama)
    const regex = new RegExp(`(${keyword})`, 'gi');

    // Ganti teks yang cocok dengan tag <mark>
    // $1 adalah referensi ke teks asli yang ditemukan (agar huruf besar/kecilnya tetap terjaga)
    return text.replace(regex, '<mark>$1</mark>');
}