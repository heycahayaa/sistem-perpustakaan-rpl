// js/books.js

// Fungsi untuk mengambil data buku dari backend Node.js
function renderBookTable() {
    const tableBody = document.getElementById("bookTableBody");
    if (!tableBody) return;

    const searchValue = document.getElementById("bookSearch") ? document.getElementById("bookSearch").value.toLowerCase() : "";
    const categoryValue = document.getElementById("categoryFilter") ? document.getElementById("categoryFilter").value : "";
    const statusValue = document.getElementById("statusFilter") ? document.getElementById("statusFilter").value : "";

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            // Update widget stats di katalog secara dinamis dari database backend
            if (document.getElementById("totalBooks")) document.getElementById("totalBooks").textContent = books.length;
            if (document.getElementById("availableBooks")) document.getElementById("availableBooks").textContent = books.filter(b => b.status === "Tersedia").length;
            if (document.getElementById("borrowedBooks")) document.getElementById("borrowedBooks").textContent = books.filter(b => b.status === "Dipinjam").length;
            if (document.getElementById("lowStockBooks")) document.getElementById("lowStockBooks").textContent = books.filter(b => b.stok <= 2).length;

            const filteredBooks = books.filter(book => {
                const searchableText = `${book.judul} ${book.penulis} ${book.lokasi_rak}`.toLowerCase();
                const matchSearch = searchableText.includes(searchValue);
                const matchCategory = !categoryValue || book.kategori === categoryValue;
                const matchStatus = !statusValue || book.status === statusValue;
                return matchSearch && matchCategory && matchStatus;
            });

            if (filteredBooks.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Buku tidak ditemukan</td></tr>`;
                return;
            }

            const isMemberView = document.body.dataset.bookView === "member";

            tableBody.innerHTML = filteredBooks.map(book => {
                const actionButtons = isMemberView
                    ? `
                        <button type="button" class="btn btn-light" onclick="showBookDetail(${book.id_buku})" title="Lihat detail">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    `
                    : `
                        <button type="button" class="btn btn-light" onclick="showBookDetail(${book.id_buku})" title="Lihat detail">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-light text-danger" onclick="deleteBook(${book.id_buku})" title="Hapus buku">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `;

                return `
                <tr>
                    <td>
                        <div class="book-title-cell">
                            <div class="book-mini-cover"><i class="fa-solid fa-book"></i></div>
                            <div>
                                <h6>${book.judul}</h6>
                                <small>${book.kode_buku}</small>
                            </div>
                        </div>
                    </td>
                    <td>${book.penulis}</td>
                    <td>${book.kategori}</td>
                    <td>${book.lokasi_rak}</td>
                    <td>${book.stok}</td>
                    <td>
                        <span class="status-badge status-${book.status.toLowerCase()}">
                            <i class="fa-solid fa-circle"></i> ${book.status}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            ${actionButtons}
                        </div>
                    </td>
                </tr>
                `;
            }).join("");
        });
}

// Fungsi untuk membuat / mendaftarkan buku baru (Create)
function handleBookFormSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const bookPayload = {
        bookCode: document.getElementById("bookCode").value.trim(),
        bookTitle: document.getElementById("bookTitle").value.trim(),
        bookAuthor: document.getElementById("bookAuthor").value.trim(),
        bookCategory: document.getElementById("bookCategory").value,
        bookStock: document.getElementById("bookStock").value,
        bookLocation: document.getElementById("bookLocation").value.trim(),
        bookStatus: document.getElementById("bookStatus").value,
        bookSynopsis: document.getElementById("bookSynopsis").value.trim()
    };

    fetch('/api/buku', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookPayload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById("formSuccess").classList.remove("d-none");
            setTimeout(() => { window.location.href = "daftar-buku.html"; }, 900);
        } else {
            alert(data.message);
        }
    });
}

// Fungsi untuk menghapus data buku (Delete)
window.deleteBook = function(bookId) {
    if (confirm("Hapus buku ini dari database?")) {
        fetch(`/api/buku/${bookId}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderBookTable();
            }
        });
    }
};

// Fungsi untuk melihat pop-up modal detail buku
window.showBookDetail = function(bookId) {
    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            const book = books.find(item => item.id_buku === bookId);
            if (!book) return;

            document.getElementById("detailTitle").textContent = book.judul;
            document.getElementById("detailAuthor").textContent = book.penulis;
            document.getElementById("detailCategory").textContent = book.kategori;
            document.getElementById("detailLocation").textContent = book.lokasi_rak;
            document.getElementById("detailStock").textContent = `${book.stok} eksemplar`;
            document.getElementById("detailStatus").innerHTML = `
                <span class="status-badge status-${book.status.toLowerCase()}">
                    <i class="fa-solid fa-circle"></i> ${book.status}
                </span>
            `;
            document.getElementById("detailSynopsis").textContent = book.sinopsis;

            const detailModal = new bootstrap.Modal(document.getElementById("bookDetailModal"));
            detailModal.show();
        });
};

// Fungsi pencarian khusus sistem Grid Kartu milik Anggota (Searchbar Fix)
function renderSearchResults() {
    const resultGrid = document.getElementById("searchResultGrid");
    if (!resultGrid) return;

    const keyword = document.getElementById("searchKeyword").value.trim().toLowerCase();
    const emptyState = document.getElementById("searchEmptyState");
    const hintState = document.getElementById("searchHintState");

    if (!keyword) {
        resultGrid.innerHTML = "";
        if (emptyState) emptyState.classList.add("d-none");
        if (hintState) hintState.classList.remove("d-none");
        return;
    }

    if (hintState) hintState.classList.add("d-none");

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            const results = books.filter(book => {
                const searchableText = `${book.judul} ${book.penulis} ${book.kategori}`.toLowerCase();
                return searchableText.includes(keyword);
            });

            if (results.length === 0) {
                resultGrid.innerHTML = "";
                if (emptyState) emptyState.classList.remove("d-none");
                return;
            }

            if (emptyState) emptyState.classList.add("d-none");
            
            resultGrid.innerHTML = results.map(book => `
                <div class="col-lg-4 col-md-6">
                    <div class="card book-search-card p-3 h-100">
                        <div class="d-flex gap-3">
                            <div class="book-mini-cover"><i class="fa-solid fa-book"></i></div>
                            <div>
                                <h6 class="mb-1">${book.judul}</h6>
                                <small class="text-muted d-block">${book.penulis}</small>
                                <span class="status-badge status-${book.status.toLowerCase()} mt-2">
                                    <i class="fa-solid fa-circle"></i> ${book.status}
                                </span>
                            </div>
                        </div>
                        <p class="detail-synopsis mt-3 mb-0">${book.sinopsis}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <small class="text-muted"><i class="fa-solid fa-location-dot"></i> Rak ${book.lokasi_rak}</small>
                            <button type="button" class="btn btn-light btn-sm" onclick="showBookDetail(${book.id_buku})">
                                <i class="fa-solid fa-eye"></i> Detail
                            </button>
                        </div>
                    </div>
                </div>
            `).join("");
        });
}

function updatePreview() {
    if (!document.getElementById("previewTitle")) return;
    document.getElementById("previewTitle").textContent = document.getElementById("bookTitle").value || "Judul Buku";
    document.getElementById("previewAuthor").textContent = document.getElementById("bookAuthor").value || "Nama penulis";
    document.getElementById("previewCategory").textContent = document.getElementById("bookCategory").value || "Kategori";
    document.getElementById("previewLocation").textContent = document.getElementById("bookLocation").value || "Rak";
    document.getElementById("previewStatus").textContent = document.getElementById("bookStatus").value || "Status";
    document.getElementById("previewSynopsis").textContent = document.getElementById("bookSynopsis").value || "Sinopsis akan tampil di sini.";
}

document.addEventListener("DOMContentLoaded", () => {
    const bookSearch = document.getElementById("bookSearch");
    const bookForm = document.getElementById("bookForm");
    const searchKeyword = document.getElementById("searchKeyword");

    if (bookSearch) {
        renderBookTable();
        bookSearch.addEventListener("input", renderBookTable);
        document.getElementById("categoryFilter").addEventListener("change", renderBookTable);
        document.getElementById("statusFilter").addEventListener("change", renderBookTable);
    }

    if (bookForm) {
        updatePreview();
        bookForm.addEventListener("input", updatePreview);
        bookForm.addEventListener("change", updatePreview);
        bookForm.addEventListener("submit", handleBookFormSubmit);
    }

    if (searchKeyword) {
        searchKeyword.addEventListener("input", renderSearchResults);
    }
    
    // Sinkronisasi data total koleksi di halaman dashboard utama admin/anggota
    const totalTargets = document.querySelectorAll("[data-book-total]");
    if (totalTargets.length > 0) {
        fetch('/api/buku').then(res => res.json()).then(books => {
            totalTargets.forEach(t => t.textContent = books.length);
        });
    }
});
