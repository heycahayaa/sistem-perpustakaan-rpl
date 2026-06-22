const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// DATABASENYA PINDAH KE SINI (Variabel lokal di dalam program)
let DATA_PERPUSTAKAAN = {
    users: [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "anggota", password: "anggota123", role: "anggota" }
    ],
    buku: [
        {
            id_buku: 1,
            kode_buku: "B001",
            judul: "Belajar Node.js itu Mudah",
            penulis: "Cahaya",
            kategori: "Teknologi",
            stok: 5,
            lokasi_rak: "Rak A1",
            status: "Tersedia",
            sinopsis: "Buku panduan belajar backend Node.js dari dasar."
        }
    ]
};

// --- API PROSES LOGIN (Tanpa File JSON) ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = DATA_PERPUSTAKAAN.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.json({ success: false, message: "Username atau password salah." });
    }
});

// --- API READ BUKU ---
app.get('/api/buku', (req, res) => {
    res.json(DATA_PERPUSTAKAAN.buku);
});

// --- API CREATE BUKU --
app.post('/api/buku', (req, res) => {
    const { bookCode, bookTitle, bookAuthor, bookCategory, bookStock, bookLocation, bookStatus, bookSynopsis } = req.body;
    
    if (DATA_PERPUSTAKAAN.buku.some(b => b.kode_buku.toLowerCase() === bookCode.toLowerCase())) {
        return res.json({ success: false, message: `Kode Buku "${bookCode}" sudah terdaftar!` });
    }

    const newBook = {
        id_buku: Date.now(),
        kode_buku: bookCode,
        judul: bookTitle,
        penulis: bookAuthor,
        kategori: bookCategory,
        stok: parseInt(bookStock),
        lokasi_rak: bookLocation,
        status: bookStatus,
        sinopsis: bookSynopsis
    };
    
    DATA_PERPUSTAKAAN.buku.push(newBook);
    res.json({ success: true, message: "Buku berhasil ditambahkan!" });
});

// --- API DELETE BUKU ---
app.delete('/api/buku/:id', (req, res) => {
    const idBuku = parseInt(req.params.id);
    
    DATA_PERPUSTAKAAN.buku = DATA_PERPUSTAKAAN.buku.filter(b => b.id_buku !== idBuku);
    res.json({ success: true, message: "Buku berhasil dihapus!" });
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Backend berjalan di http://localhost:${PORT}`);
    console.log(`Buka browser di: http://localhost:${PORT}/login.html`);
    console.log(`=======================================================`);
});
