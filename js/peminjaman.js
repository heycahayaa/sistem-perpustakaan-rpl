// js/peminjaman.js

document.addEventListener("DOMContentLoaded", () => {
    renderLoanTable();
});

function renderLoanTable() {
    const loanTableBody = document.getElementById("loanTableBody");
    if (!loanTableBody) return;

    // Mengambil data terpusat secara dinamis dari backend Node.js
    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
            // Menyaring buku yang status sirkulasinya sedang aktif (Dipinjam atau Reservasi)
            const borrowedBooks = books.filter(b => b.status === "Dipinjam" || b.status === "Reservasi");

            // Sinkronisasi angka counter mini statistik di dashboard peminjaman anggota
            if (document.getElementById("activeLoansCount")) {
                document.getElementById("activeLoansCount").textContent = borrowedBooks.filter(b => b.status === "Dipinjam").length;
            }

            if (borrowedBooks.length === 0) {
                loanTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Kamu tidak memiliki riwayat peminjaman aktif</td></tr>`;
                return;
            }

            // Merender baris tabel sirkulasi secara dinamis dari database.json
            loanTableBody.innerHTML = borrowedBooks.map((book, index) => {
                const deadlineDate = book.status === "Dipinjam" ? "28 Juni 2026" : "-";
                const badgeClass = book.status === "Dipinjam" ? "status-dipinjam" : "status-reservasi";

                return `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="text-primary"><i class="fa-solid fa-book"></i></div>
                            <div>
                                <h6 class="mb-0 fw-semibold">${book.judul}</h6>
                                <small class="text-muted">${book.kode_buku}</small>
                            </div>
                        </div>
                    </td>
                    <td>21 Juni 2026</td>
                    <td>${deadlineDate}</td>
                    <td>
                        <span class="status-badge ${badgeClass}">
                            <i class="fa-solid fa-circle"></i> ${book.status}
                        </span>
                    </td>
                    <td>
                        ${book.status === 'Dipinjam' ? 
                            `<button class="btn btn-sm btn-outline-primary" onclick="alert('Permintaan perpanjangan buku &quot;${book.judul}&quot; berhasil dikirim ke Admin!')">Perpanjang</button>` : 
                            `<button class="btn btn-sm btn-outline-secondary" disabled>Menunggu Antrean</button>`
                        }
                    </td>
                </tr>
                `;
            }).join("");
        })
        .catch(err => {
            console.error("Gagal memuat data sirkulasi dari backend:", err);
            loanTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Gagal terhubung ke server backend!</td></tr>`;
        });
}
