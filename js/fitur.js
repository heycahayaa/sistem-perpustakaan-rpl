const LOAN_DURATION_DAYS = 7;
const FINE_PER_DAY = 2000;

const demoLoans = [
    {
        id: 1,
        bookId: 3,
        borrowerName: "Andi Wijaya",
        loanDate: addDays(new Date(), -10),
        dueDate: addDays(new Date(), -3),
        status: "Dipinjam",
        returnDate: null,
        fine: 0
    },
    {
        id: 2,
        bookId: 4,
        borrowerName: "Siti Aminah",
        loanDate: addDays(new Date(), -2),
        dueDate: addDays(new Date(), 5),
        status: "Dipinjam",
        returnDate: null,
        fine: 0
    }
];

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return formatISODate(result);
}

function formatISODate(date) {
    return date.toISOString().slice(0, 10);
}

function formatDisplayDate(isoDate) {
    if (!isoDate) {
        return "-";
    }

    return new Date(isoDate).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

function getLoanData() {
    const savedLoans = localStorage.getItem("libraryLoans");

    if (!savedLoans) {
        localStorage.setItem("libraryLoans", JSON.stringify(demoLoans));
        return demoLoans;
    }

    return JSON.parse(savedLoans);
}

function saveLoanData(loans) {
    localStorage.setItem("libraryLoans", JSON.stringify(loans));
}

function getLoanStatusClass(status) {
    const map = {
        "Dipinjam": "status-dipinjam",
        "Terlambat": "status-rusak",
        "Dikembalikan": "status-tersedia"
    };

    return map[status] || "status-tersedia";
}

function renderBookOptions() {
    const select = document.getElementById("loanBookId");

    if (!select) {
        return;
    }

    const books = getBookData();

    select.innerHTML = `<option value="">Pilih buku</option>` +
        books.map(book => `
            <option value="${book.id}" ${book.status !== "Tersedia" ? "disabled" : ""}>
                ${book.title} (${book.code}) — ${book.status === "Tersedia" ? `Stok ${book.stock}` : book.status}
            </option>
        `).join("");
}

function handleLoanFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    const bookId = Number(document.getElementById("loanBookId").value);
    const borrowerName = document.getElementById("loanBorrowerName").value.trim();

    const resultBox = document.getElementById("loanResult");
    resultBox.classList.add("d-none");
    resultBox.classList.remove("alert-success", "alert-danger");

    const books = getBookData();
    const book = books.find(item => item.id === bookId);

    if (book && book.status === "Tersedia" && book.stock > 0) {

        const updatedBooks = books.map(item => {
            if (item.id !== bookId) {
                return item;
            }

            const nextStock = item.stock - 1;

            return {
                ...item,
                stock: nextStock,
                status: nextStock > 0 ? "Tersedia" : "Dipinjam"
            };
        });
        saveBookData(updatedBooks);

        const loans = getLoanData();
        const newLoan = {
            id: Date.now(),
            bookId: book.id,
            borrowerName,
            loanDate: formatISODate(new Date()),
            dueDate: addDays(new Date(), LOAN_DURATION_DAYS),
            status: "Dipinjam",
            returnDate: null,
            fine: 0
        };
        saveLoanData([...loans, newLoan]);

        resultBox.classList.remove("d-none");
        resultBox.classList.add("alert-success");
        resultBox.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            Peminjaman berhasil dicatat. Buku <strong>${book.title}</strong> dipinjamkan kepada
            <strong>${borrowerName}</strong>. Jatuh tempo: <strong>${formatDisplayDate(newLoan.dueDate)}</strong>.
        `;

        form.reset();
        form.classList.remove("was-validated");
        renderBookOptions();
        renderLoanTable();
        return;
    }

    resultBox.classList.remove("d-none");
    resultBox.classList.add("alert-danger");
    resultBox.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        Peminjaman gagal. Stok buku tidak tersedia saat ini.
    `;
}

function renderLoanTable() {
    const tableBody = document.getElementById("loanTableBody");

    if (!tableBody) {
        return;
    }

    const loans = getLoanData();
    const books = getBookData();
    const activeLoans = loans
        .filter(loan => loan.status !== "Dikembalikan")
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    if (activeLoans.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    Belum ada peminjaman aktif.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = activeLoans.map(loan => {
        const book = books.find(item => item.id === loan.bookId);
        const isOverdue = new Date(loan.dueDate) < new Date(formatISODate(new Date()));
        const displayStatus = isOverdue ? "Terlambat" : "Dipinjam";

        return `
            <tr>
                <td>
                    <h6 class="mb-0">${book ? book.title : "Buku tidak ditemukan"}</h6>
                    <small class="text-muted">${book ? book.code : "-"}</small>
                </td>
                <td>${loan.borrowerName}</td>
                <td>${formatDisplayDate(loan.loanDate)}</td>
                <td>${formatDisplayDate(loan.dueDate)}</td>
                <td>
                    <span class="status-badge ${getLoanStatusClass(displayStatus)}">
                        <i class="fa-solid fa-circle"></i>
                        ${displayStatus}
                    </span>
                </td>
                <td class="text-end">
                    <a href="pengembalian.html?loan=${loan.id}" class="btn btn-light" title="Proses pengembalian">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </a>
                </td>
            </tr>
        `;
    }).join("");
}

function renderReturnOptions() {
    const select = document.getElementById("returnLoanId");

    if (!select) {
        return;
    }

    const loans = getLoanData().filter(loan => loan.status !== "Dikembalikan");
    const books = getBookData();

    select.innerHTML = `<option value="">Pilih peminjaman</option>` +
        loans.map(loan => {
            const book = books.find(item => item.id === loan.bookId);
            return `
                <option value="${loan.id}">
                    ${book ? book.title : "Buku tidak ditemukan"} — ${loan.borrowerName} (jatuh tempo ${formatDisplayDate(loan.dueDate)})
                </option>
            `;
        }).join("");

    const params = new URLSearchParams(window.location.search);
    const preselectLoanId = params.get("loan");

    if (preselectLoanId) {
        select.value = preselectLoanId;
        select.dispatchEvent(new Event("change"));
    }
}

function calculateFine(dueDate, returnDate) {
    const due = new Date(dueDate);
    const back = new Date(returnDate);
    const diffDays = Math.round((back - due) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
        return { lateDays: 0, fine: 0 };
    }

    return { lateDays: diffDays, fine: diffDays * FINE_PER_DAY };
}

function handleReturnLoanChange(event) {
    const loanId = Number(event.currentTarget.value);
    const fineSection = document.getElementById("fineSection");
    const onTimeSection = document.getElementById("onTimeSection");

    fineSection.classList.add("d-none");
    onTimeSection.classList.add("d-none");

    if (!loanId) {
        return;
    }

    const loan = getLoanData().find(item => item.id === loanId);

    if (!loan) {
        return;
    }

    const today = formatISODate(new Date());
    const { lateDays, fine } = calculateFine(loan.dueDate, today);

    if (lateDays > 0) {
        fineSection.classList.remove("d-none");
        document.getElementById("fineLateDays").textContent = lateDays;
        document.getElementById("fineAmount").textContent = `Rp${fine.toLocaleString("id-ID")}`;
        document.getElementById("returnForm").dataset.fine = fine;
        document.getElementById("returnForm").dataset.lateDays = lateDays;
        return;
    }

    onTimeSection.classList.remove("d-none");
    document.getElementById("returnForm").dataset.fine = 0;
    document.getElementById("returnForm").dataset.lateDays = 0;
}

function handleReturnFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const loanId = Number(document.getElementById("returnLoanId").value);

    if (!loanId) {
        form.classList.add("was-validated");
        return;
    }

    const fine = Number(form.dataset.fine || 0);
    const today = formatISODate(new Date());

    const loans = getLoanData();
    const loan = loans.find(item => item.id === loanId);

    const updatedLoans = loans.map(item =>
        item.id === loanId
            ? { ...item, status: "Dikembalikan", returnDate: today, fine }
            : item
    );
    saveLoanData(updatedLoans);

    if (loan) {
        const books = getBookData();
        const updatedBooks = books.map(item =>
            item.id === loan.bookId
                ? { ...item, stock: item.stock + 1, status: "Tersedia" }
                : item
        );
        saveBookData(updatedBooks);
    }

    const resultBox = document.getElementById("returnResult");
    resultBox.classList.remove("d-none");
    resultBox.classList.add("alert-success");
    resultBox.innerHTML = fine > 0
        ? `
            <i class="fa-solid fa-circle-check"></i>
            Pengembalian berhasil dicatat. Denda <strong>Rp${fine.toLocaleString("id-ID")}</strong> telah dibayarkan.
        `
        : `
            <i class="fa-solid fa-circle-check"></i>
            Pengembalian berhasil dicatat. Tidak ada denda, buku dikembalikan tepat waktu.
        `;

    form.reset();
    form.classList.remove("was-validated");
    document.getElementById("fineSection").classList.add("d-none");
    document.getElementById("onTimeSection").classList.add("d-none");

    renderReturnOptions();
    renderLoanTable();
}

function renderSearchResults() {
    const resultGrid = document.getElementById("searchResultGrid");

    if (!resultGrid) {
        return;
    }

    const keyword = document.getElementById("searchKeyword").value.trim().toLowerCase();
    const emptyState = document.getElementById("searchEmptyState");
    const hintState = document.getElementById("searchHintState");

    if (!keyword) {
        resultGrid.innerHTML = "";
        emptyState.classList.add("d-none");
        hintState.classList.remove("d-none");
        return;
    }

    const books = getBookData();
    const results = books.filter(book => {
        const searchableText = `${book.title} ${book.author} ${book.category}`.toLowerCase();
        return searchableText.includes(keyword);
    });

    hintState.classList.add("d-none");

    if (results.length === 0) {
        resultGrid.innerHTML = "";
        emptyState.classList.remove("d-none");
        return;
    }

    emptyState.classList.add("d-none");
    resultGrid.innerHTML = results.map(book => `
        <div class="col-lg-4 col-md-6">
            <div class="card book-search-card p-3 h-100">
                <div class="d-flex gap-3">
                    ${renderCoverMarkup(book, "mini")}
                    <div>
                        <h6 class="mb-1">${book.title}</h6>
                        <small class="text-muted d-block">${book.author}</small>
                        <span class="status-badge ${getStatusClass(book.status)} mt-2">
                            <i class="fa-solid fa-circle"></i>
                            ${book.status}
                        </span>
                    </div>
                </div>
                <p class="detail-synopsis mt-3 mb-0">${book.synopsis}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <small class="text-muted"><i class="fa-solid fa-location-dot"></i> Rak ${book.location}</small>
                    <button type="button" class="btn btn-light btn-sm" onclick="showBookDetail(${book.id})">
                        <i class="fa-solid fa-eye"></i> Detail
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function renderMyLoans() {
    const container = document.getElementById("myLoanList");

    if (!container) {
        return;
    }

    const nameFilter = document.getElementById("myLoanName").value.trim().toLowerCase();
    const loans = getLoanData();
    const books = getBookData();

    const matchedLoans = nameFilter
        ? loans.filter(loan => loan.borrowerName.toLowerCase().includes(nameFilter))
        : [];

    if (!nameFilter) {
        container.innerHTML = "";
        document.getElementById("myLoanHint").classList.remove("d-none");
        document.getElementById("myLoanEmpty").classList.add("d-none");
        return;
    }

    document.getElementById("myLoanHint").classList.add("d-none");

    if (matchedLoans.length === 0) {
        container.innerHTML = "";
        document.getElementById("myLoanEmpty").classList.remove("d-none");
        return;
    }

    document.getElementById("myLoanEmpty").classList.add("d-none");

    container.innerHTML = matchedLoans
        .sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate))
        .map(loan => {
            const book = books.find(item => item.id === loan.bookId);
            const isOverdue = loan.status === "Dipinjam" && new Date(loan.dueDate) < new Date(formatISODate(new Date()));
            const displayStatus = loan.status === "Dikembalikan" ? "Dikembalikan" : (isOverdue ? "Terlambat" : "Dipinjam");

            return `
                <div class="card section-card p-3 mb-3">
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                            <h6 class="mb-1">${book ? book.title : "Buku tidak ditemukan"}</h6>
                            <small class="text-muted">
                                Dipinjam ${formatDisplayDate(loan.loanDate)} · Jatuh tempo ${formatDisplayDate(loan.dueDate)}
                            </small>
                        </div>
                        <span class="status-badge ${getLoanStatusClass(displayStatus)}">
                            <i class="fa-solid fa-circle"></i>
                            ${displayStatus}
                        </span>
                    </div>
                    ${loan.status === "Dikembalikan" ? `
                        <div class="mt-2 small text-muted">
                            Dikembalikan ${formatDisplayDate(loan.returnDate)}
                            ${loan.fine > 0 ? ` · Denda dibayar Rp${loan.fine.toLocaleString("id-ID")}` : " · Tanpa denda"}
                        </div>
                    ` : ""}
                </div>
            `;
        }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    const loanForm = document.getElementById("loanForm");
    const returnForm = document.getElementById("returnForm");
    const returnLoanSelect = document.getElementById("returnLoanId");
    const searchKeyword = document.getElementById("searchKeyword");
    const myLoanName = document.getElementById("myLoanName");

    if (loanForm) {
        renderBookOptions();
        renderLoanTable();
        loanForm.addEventListener("submit", handleLoanFormSubmit);
    }

    if (returnForm) {
        renderReturnOptions();
        returnLoanSelect.addEventListener("change", handleReturnLoanChange);
        returnForm.addEventListener("submit", handleReturnFormSubmit);
    }

    if (searchKeyword) {
        renderSearchResults();
        searchKeyword.addEventListener("input", renderSearchResults);
    }

    if (myLoanName) {
        renderMyLoans();
        myLoanName.addEventListener("input", renderMyLoans);
    }
});
