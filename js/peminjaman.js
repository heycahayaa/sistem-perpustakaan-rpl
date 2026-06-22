// js/peminjaman.js

document.addEventListener("DOMContentLoaded", () => {
    // === LOGIKA UNTUK HALAMAN PEMINJAMAN ADMIN ===
    if (document.getElementById("loanBookSelect")) {
        populateBookDropdown();
    }
    if (document.getElementById("activeLoanTableBody")) {
        renderActiveLoans();
    }

    // === LOGIKA UNTUK HALAMAN PENGEMBALIAN ADMIN ===
    if (document.getElementById("returnLoanId")) {
        populateReturnDropdown();
        renderWaitingReturns();
    }

    const returnForm = document.getElementById("returnForm");
    if (returnForm) {
        returnForm.addEventListener("submit", handleReturnSubmit);
    }

    // === LOGIKA HALAMAN PEMINJAMAN SAYA (ANGGOTA) ===
    const myLoanInput = document.getElementById("myLoanName");
    if (myLoanInput) {
        // Jalankan pencarian setiap kali ada huruf baru yang diketik anggota
        myLoanInput.addEventListener("input", renderLoanTableMember);
    }
});

// --- FUNGSI HALAMAN PEMINJAMAN ADMIN ---
function populateBookDropdown() {
    const bookSelect = document.getElementById("loanBookSelect");
    if (!bookSelect) return;

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            bookSelect.innerHTML = `<option value="" disabled selected>Pilih buku</option>`;
            const availableBooks = books.filter(b => b.stok > 0);
            if (availableBooks.length === 0) {
                bookSelect.innerHTML += `<option value="" disabled>Tidak ada koleksi buku tersedia</option>`;
                return;
            }
            availableBooks.forEach(book => {
                const option = document.createElement("option");
                option.value = book.id_buku;
                option.textContent = `${book.judul} (${book.kode_buku}) - Rak ${book.lokasi_rak}`;
                bookSelect.appendChild(option);
            });
        });
}

function renderActiveLoans() {
    const activeLoanTable = document.getElementById("activeLoanTableBody");
    if (!activeLoanTable) return;

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            const borrowedBooks = books.filter(b => b.status === "Dipinjam");
            if (borrowedBooks.length === 0) {
                activeLoanTable.innerHTML = `<tr><td colspan="6" class="text-center py-3 text-muted">Tidak ada transaksi peminjaman aktif</td></tr>`;
                return;
            }
            activeLoanTable.innerHTML = borrowedBooks.map((book, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${book.judul}</strong><br><small class="text-muted">${book.kode_buku}</small></td>
                    <td>Anggota Perpus</td>
                    <td>22 Juni 2026</td>
                    <td>29 Juni 2026</td>
                    <td><span class="status-badge status-dipinjam"><i class="fa-solid fa-circle"></i> Dipinjam</span></td>
                </tr>
            `).join("");
        });
}

// --- FUNGSI HALAMAN PENGEMBALIAN ADMIN ---
function populateReturnDropdown() {
    const returnSelect = document.getElementById("returnLoanId");
    if (!returnSelect) return;

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            returnSelect.innerHTML = `<option value="" disabled selected>Pilih peminjaman</option>`;
            const activeLoans = books.filter(b => b.status === "Dipinjam");

            if (activeLoans.length === 0) {
                returnSelect.innerHTML += `<option value="" disabled>Tidak ada transaksi aktif</option>`;
                return;
            }

            activeLoans.forEach(book => {
                const option = document.createElement("option");
                option.value = book.id_buku;
                option.textContent = `Anggota Perpus - Meminjam "${book.judul}"`;
                returnSelect.appendChild(option);
            });
        });
}

function renderWaitingReturns() {
    const waitingTable = document.getElementById("returnTableBody");
    if (!waitingTable) return;

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            const activeLoans = books.filter(b => b.status === "Dipinjam");

            if (activeLoans.length === 0) {
                waitingTable.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Tidak ada peminjaman menunggu dikembalikan</td></tr>`;
                return;
            }

            waitingTable.innerHTML = activeLoans.map((book, index) => `
                <tr>
                    <td><strong>${book.judul}</strong><br><small class="text-muted">${book.kode_buku}</small></td>
                    <td>Anggota Perpus</td>
                    <td>22 Juni 2026</td>
                    <td>29 Juni 2026</td>
                    <td><span class="badge bg-warning text-dark">Dipinjam</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-success" onclick="alert('Buku ${book.judul} berhasil diterima kembali!')">
                            <i class="fa-solid fa-check"></i> Terima
                        </button>
                    </td>
                </tr>
            `).join("");
        });
}

function handleReturnSubmit(event) {
    event.preventDefault();
    alert("Konfirmasi pengembalian sukses! Stok buku otomatis bertambah.");
}

// === FUNGSI SISI ANGGOTA (SINKRONISASI PENCARIAN & HALAMAN LIST) ===
function renderLoanTableMember() {
    const myLoanInput = document.getElementById("myLoanName");
    const myLoanList = document.getElementById("myLoanList");
    const myLoanHint = document.getElementById("myLoanHint");
    const myLoanEmpty = document.getElementById("myLoanEmpty");

    if (!myLoanInput || !myLoanList) return;

    const keyword = myLoanInput.value.trim().toLowerCase();

    // Jika kolom pencarian kosong, kembalikan ke petunjuk awal
    if (!keyword) {
        myLoanList.innerHTML = "";
        myLoanHint.classList.remove("d-none");
        myLoanEmpty.classList.add("d-none");
        return;
    }

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            // Filter buku yang sedang dipinjam atau direservasi di database
            const borrowedBooks = books.filter(b => b.status === "Dipinjam" || b.status === "Reservasi");

            if (borrowedBooks.length === 0) {
                myLoanList.innerHTML = "";
                myLoanHint.classList.add("d-none");
                myLoanEmpty.classList.remove("d-none");
                return;
            }

            // Sembunyikan semua placeholder petunjuk karena data ada
            myLoanHint.classList.add("d-none");
            myLoanEmpty.classList.add("d-none");

            // Bangun komponen tabel Bootstrap dinamis di dalam elemen pembungkus
            myLoanList.innerHTML = `
                <div class="card section-card p-4">
                    <div class="table-responsive">
                        <table class="table align-middle table-hover m-0">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Buku</th>
                                    <th>Nama Peminjam</th>
                                    <th>Tgl Pinjam</th>
                                    <th>Jatuh Tempo</th>
                                    <th>Status</th>
                                    <th class="text-end">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${borrowedBooks.map((book, index) => {
                                    const badgeClass = book.status === "Dipinjam" ? "bg-warning text-dark" : "bg-secondary text-white";
                                    return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>
                                            <strong>${book.judul}</strong><br>
                                            <small class="text-muted">${book.kode_buku}</small>
                                        </td>
                                        <td>${myLoanInput.value}</td>
                                        <td>22 Juni 2026</td>
                                        <td>${book.status === 'Dipinjam' ? '29 Juni 2026' : '-'}</td>
                                        <td><span class="badge ${badgeClass}">${book.status}</span></td>
                                        <td class="text-end">
                                            ${book.status === 'Dipinjam' ? 
                                                `<button class="btn btn-sm btn-outline-primary" onclick="alert('Permintaan perpanjangan buku &quot;${book.judul}&quot; berhasil dikirim ke Admin!')">Perpanjang</button>` : 
                                                `<button class="btn btn-sm btn-outline-secondary" disabled>Antrean Reservasi</button>`
                                            }
                                        </td>
                                    </tr>`;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        })
        .catch(err => console.error("Gagal memuat status peminjaman anggota:", err));
}
