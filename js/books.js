function renderBookTable() {
    const tableBody = document.getElementById("bookTableBody");
    if (!tableBody) return;

    const searchValue = document.getElementById("bookSearch") ? document.getElementById("bookSearch").value.toLowerCase() : "";
    const categoryValue = document.getElementById("categoryFilter") ? document.getElementById("categoryFilter").value : "";
    const statusValue = document.getElementById("statusFilter") ? document.getElementById("statusFilter").value : "";

    fetch('/api/buku')
        .then(res => res.json())
        .then(books => {
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

            tableBody.innerHTML = filteredBooks.map(book => `
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
                            <button type="button" class="btn btn-light text-danger" onclick="deleteBook(${book.id_buku})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join("");
        });
}

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

function updatePreview() {
    if (!document.getElementById("previewTitle")) return;
    document.getElementById("previewTitle").textContent = document.getElementById("bookTitle").value || "Judul Buku";
    document.getElementById("previewAuthor").textContent = document.getElementById("bookAuthor").value || "Nama penulis";
    document.getElementById("previewCategory").textContent = document.getElementById("bookCategory").value || "Kategori";
    document.getElementById("previewLocation").textContent = document.getElementById("bookLocation").value || "Rak";
    document.getElementById("previewStatus").textContent = document.getElementById("bookStatus").value || "Status";
    document.getElementById("previewSynopsis").textContent = document.getElementById("bookSynopsis").value || "Sinopsis akan tampil.";
}

document.addEventListener("DOMContentLoaded", () => {
    const bookSearch = document.getElementById("bookSearch");
    const bookForm = document.getElementById("bookForm");

    if (bookSearch) {
        renderBookTable();
        bookSearch.addEventListener("input", renderBookTable);
        document.getElementById("categoryFilter").addEventListener("change", renderBookTable);
        document.getElementById("statusFilter").addEventListener("change", renderBookTable);
    }

    if (bookForm) {
        bookForm.addEventListener("input", updatePreview);
        bookForm.addEventListener("change", updatePreview);
        bookForm.addEventListener("submit", handleBookFormSubmit);
    }
    
    const totalTargets = document.querySelectorAll("[data-book-total]");
    if(totalTargets.length > 0) {
        fetch('/api/buku').then(res => res.json()).then(books => {
            totalTargets.forEach(t => t.textContent = books.length);
        });
    }
});
