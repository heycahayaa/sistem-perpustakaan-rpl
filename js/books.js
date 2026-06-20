const demoBooks = [
    {
        id: 1,
        code: "BK-001",
        title: "Laskar Pelangi",
        author: "Andrea Hirata",
        category: "Novel",
        location: "A1",
        stock: 5,
        status: "Tersedia",
        synopsis: "Kisah persahabatan dan perjuangan anak-anak Belitung dalam mengejar pendidikan."
    },
    {
        id: 2,
        code: "BK-002",
        title: "Bumi",
        author: "Tere Liye",
        category: "Novel",
        location: "A2",
        stock: 10,
        status: "Tersedia",
        synopsis: "Petualangan remaja dengan dunia paralel yang penuh rahasia dan kekuatan istimewa."
    },
    {
        id: 3,
        code: "BK-003",
        title: "Atomic Habits",
        author: "James Clear",
        category: "Pengembangan Diri",
        location: "B1",
        stock: 8,
        status: "Dipinjam",
        synopsis: "Panduan membangun kebiasaan kecil yang berdampak besar dalam kehidupan sehari-hari."
    },
    {
        id: 4,
        code: "BK-004",
        title: "Pemrograman Web Dasar",
        author: "Abdul Kadir",
        category: "Teknologi",
        location: "C3",
        stock: 3,
        status: "Reservasi",
        synopsis: "Pengantar HTML, CSS, JavaScript, dan konsep dasar pengembangan aplikasi web."
    },
    {
        id: 5,
        code: "BK-005",
        title: "Metodologi Penelitian Pendidikan",
        author: "Sugiyono",
        category: "Pendidikan",
        location: "D2",
        stock: 1,
        status: "Tersedia",
        synopsis: "Pembahasan metode penelitian kuantitatif, kualitatif, dan pengembangan dalam pendidikan."
    },
    {
        id: 6,
        code: "BK-006",
        title: "Basis Data",
        author: "Fathansyah",
        category: "Teknologi",
        location: "C1",
        stock: 0,
        status: "Rusak",
        synopsis: "Konsep dasar basis data, pemodelan relasi, normalisasi, dan penggunaan SQL."
    }
];

function getBookData() {
    const savedBooks = localStorage.getItem("libraryBooks");

    if (!savedBooks) {
        localStorage.setItem("libraryBooks", JSON.stringify(demoBooks));
        return demoBooks;
    }

    return JSON.parse(savedBooks);
}

function saveBookData(books) {
    localStorage.setItem("libraryBooks", JSON.stringify(books));
}

function getStatusClass(status) {
    return `status-${status.toLowerCase()}`;
}

function renderCoverMarkup(book, size = "mini") {
    const imageClass = size === "mini" ? "book-mini-cover" : "book-cover";

    if (book.cover) {
        return `
            <div class="${imageClass}">
                <img src="${book.cover}" alt="Cover buku">
            </div>
        `;
    }

    return `
        <div class="${imageClass}">
            <i class="fa-solid fa-book"></i>
        </div>
    `;
}

function setCoverElement(element, cover, title = "Cover buku") {
    if (!element) {
        return;
    }

    if (cover) {
        element.innerHTML = `<img src="${cover}" alt="${title}">`;
        return;
    }

    element.innerHTML = '<i class="fa-solid fa-book"></i>';
}

function renderDashboardTotals() {
    const totalTargets = document.querySelectorAll("[data-book-total]");

    if (totalTargets.length === 0) {
        return;
    }

    const totalBooks = getBookData().length;

    totalTargets.forEach(target => {
        target.textContent = totalBooks;
    });
}

function renderBookStats(books) {
    const totalBooks = document.getElementById("totalBooks");
    const availableBooks = document.getElementById("availableBooks");
    const borrowedBooks = document.getElementById("borrowedBooks");
    const lowStockBooks = document.getElementById("lowStockBooks");

    if (!totalBooks) {
        return;
    }

    totalBooks.textContent = books.length;
    availableBooks.textContent = books.filter(book => book.status === "Tersedia").length;
    borrowedBooks.textContent = books.filter(book => book.status === "Dipinjam").length;
    lowStockBooks.textContent = books.filter(book => book.stock <= 2).length;
}

function renderBookTable() {
    const tableBody = document.getElementById("bookTableBody");
    const emptyStateDiv = document.getElementById("emptyState");

    if (!tableBody) {
        return;
    }

    const searchValue = document.getElementById("bookSearch").value.toLowerCase();
    const categoryValue = document.getElementById("categoryFilter").value;
    const statusValue = document.getElementById("statusFilter").value;
    const books = getBookData();
    const isMemberView = document.body.dataset.bookView === "member";

    const filteredBooks = books.filter(book => {
        const searchableText = `${book.title} ${book.author} ${book.location}`.toLowerCase();
        const matchSearch = searchableText.includes(searchValue);
        const matchCategory = !categoryValue || book.category === categoryValue;
        const matchStatus = !statusValue || book.status === statusValue;

        return matchSearch && matchCategory && matchStatus;
    });

    renderBookStats(books);

    if (filteredBooks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="text-muted">
                        <i class="fa-solid fa-folder-open mb-3" style="font-size: 48px; color: #cbd5e1;"></i>
                        <h5 class="fw-bold" style="color: var(--primary);">Buku tidak ditemukan</h5>
                        <p class="mb-0">Ubah kata kunci pencarian atau filter yang sedang dipakai.</p>
                    </div>
                </td>
            </tr>
        `;
        
        if(emptyStateDiv) emptyStateDiv.classList.add("d-none");
        
        return; 
    }

    tableBody.innerHTML = filteredBooks.map(book => {
        const actionButtons = isMemberView
            ? `
                <button type="button" class="btn btn-light" onclick="showBookDetail(${book.id})" title="Lihat detail">
                    <i class="fa-solid fa-eye"></i>
                </button>
            `
            : `
                <button type="button" class="btn btn-light" onclick="showBookDetail(${book.id})" title="Lihat detail">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <a class="btn btn-light" href="tambah-buku.html?edit=${book.id}" title="Edit buku">
                    <i class="fa-solid fa-pen"></i>
                </a>
                <button type="button" class="btn btn-light text-danger" onclick="deleteBook(${book.id})" title="Hapus buku">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

        return `
        <tr>
            <td>
                <div class="book-title-cell">
                    ${renderCoverMarkup(book)}
                    <div>
                        <h6>${book.title}</h6>
                        <small>${book.code}</small>
                    </div>
                </div>
            </td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${book.location}</td>
            <td>${book.stock}</td>
            <td>
                <span class="status-badge ${getStatusClass(book.status)}">
                    <i class="fa-solid fa-circle"></i>
                    ${book.status}
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

    if(emptyStateDiv) emptyStateDiv.classList.add("d-none");
}

function showBookDetail(bookId) {
    const book = getBookData().find(item => item.id === bookId);

    if (!book) {
        return;
    }

    document.getElementById("detailTitle").textContent = book.title;
    setCoverElement(document.getElementById("detailCover"), book.cover, `Cover ${book.title}`);
    document.getElementById("detailAuthor").textContent = book.author;
    document.getElementById("detailCategory").textContent = book.category;
    document.getElementById("detailLocation").textContent = book.location;
    document.getElementById("detailStock").textContent = `${book.stock} eksemplar`;
    document.getElementById("detailStatus").innerHTML = `
        <span class="status-badge ${getStatusClass(book.status)}">
            <i class="fa-solid fa-circle"></i>
            ${book.status}
        </span>
    `;
    document.getElementById("detailSynopsis").textContent = book.synopsis;

    const detailModal = new bootstrap.Modal(document.getElementById("bookDetailModal"));
    detailModal.show();
}

function deleteBook(bookId) {
    const books = getBookData();
    const book = books.find(item => item.id === bookId);

    if (!book) {
        return;
    }

    const confirmed = confirm(`Hapus buku "${book.title}" dari daftar demo?`);

    if (!confirmed) {
        return;
    }

    saveBookData(books.filter(item => item.id !== bookId));
    renderBookTable();
}

function fillFormForEdit() {
    const form = document.getElementById("bookForm");

    if (!form) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get("edit"));

    if (!editId) {
        return;
    }

    const book = getBookData().find(item => item.id === editId);

    if (!book) {
        return;
    }

    document.getElementById("formPageTitle").textContent = "Edit Buku";
    document.getElementById("formHeading").textContent = "Edit Data Buku";
    document.getElementById("bookTitle").value = book.title;
    document.getElementById("bookCode").value = book.code;
    document.getElementById("bookAuthor").value = book.author;
    document.getElementById("bookCategory").value = book.category;
    document.getElementById("bookStock").value = book.stock;
    document.getElementById("bookLocation").value = book.location;
    document.getElementById("bookStatus").value = book.status;
    document.getElementById("bookSynopsis").value = book.synopsis;
    document.getElementById("bookForm").dataset.cover = book.cover || "";
}

function updatePreview() {
    const previewTitle = document.getElementById("previewTitle");

    if (!previewTitle) {
        return;
    }

    previewTitle.textContent = document.getElementById("bookTitle").value || "Judul Buku";
    document.getElementById("previewAuthor").textContent = document.getElementById("bookAuthor").value || "Nama penulis";
    document.getElementById("previewCategory").textContent = document.getElementById("bookCategory").value || "Kategori";
    document.getElementById("previewLocation").textContent = document.getElementById("bookLocation").value || "Rak";
    document.getElementById("previewStatus").textContent = document.getElementById("bookStatus").value || "Status";
    document.getElementById("previewSynopsis").textContent =
        document.getElementById("bookSynopsis").value || "Sinopsis akan tampil di sini saat form diisi.";
    setCoverElement(
        document.getElementById("previewCover"),
        document.getElementById("bookForm").dataset.cover,
        "Preview cover buku"
    );
}

function handleCoverInput(event) {
    const file = event.currentTarget.files[0];
    const form = document.getElementById("bookForm");

    if (!file || !form) {
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
        form.dataset.cover = reader.result;
        updatePreview();
    });

    reader.readAsDataURL(file);
}

function handleBookFormReset() {
    const form = document.getElementById("bookForm");

    setTimeout(() => {
        form.dataset.cover = "";
        updatePreview();
    }, 0);
}

function handleBookFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const editId = Number(params.get("edit"));
    const books = getBookData();
    const inputCode = document.getElementById("bookCode").value.trim();

    const isDuplicate = books.some(book => {
        if (editId && book.id === editId) return false;
        return book.code.toLowerCase() === inputCode.toLowerCase();
    });

    if (isDuplicate) {
        alert(`Maaf, Kode Buku "${inputCode}" sudah terdaftar! Silakan gunakan kode lain.`);
        return;
    }

    const bookPayload = {
        id: editId || Date.now(),
        code: inputCode,
        title: document.getElementById("bookTitle").value.trim(),
        author: document.getElementById("bookAuthor").value.trim(),
        category: document.getElementById("bookCategory").value,
        stock: Number(document.getElementById("bookStock").value),
        location: document.getElementById("bookLocation").value.trim(),
        status: document.getElementById("bookStatus").value,
        synopsis: document.getElementById("bookSynopsis").value.trim(),
        cover: form.dataset.cover || ""
    };

    const nextBooks = editId
        ? books.map(book => book.id === editId ? bookPayload : book)
        : [...books, bookPayload];

    saveBookData(nextBooks);

    document.getElementById("formSuccess").classList.remove("d-none");
    form.classList.remove("was-validated");

    setTimeout(() => {
        window.location.href = "daftar-buku.html";
    }, 900);
}

document.addEventListener("DOMContentLoaded", () => {
    const bookSearch = document.getElementById("bookSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const bookForm = document.getElementById("bookForm");
    const bookCover = document.getElementById("bookCover");

    renderDashboardTotals();

    if (bookSearch) {
        renderBookTable();
        bookSearch.addEventListener("input", renderBookTable);
        categoryFilter.addEventListener("change", renderBookTable);
        statusFilter.addEventListener("change", renderBookTable);
    }

    if (bookForm) {
        fillFormForEdit();
        updatePreview();
        bookForm.addEventListener("input", updatePreview);
        bookForm.addEventListener("change", updatePreview);
        bookForm.addEventListener("reset", handleBookFormReset);
        bookForm.addEventListener("submit", handleBookFormSubmit);

        if (bookCover) {
            bookCover.addEventListener("change", handleCoverInput);
        }
    }
});
