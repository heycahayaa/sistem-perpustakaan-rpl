const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

const readDB = () => {
    const data = fs.readFileSync(path.join(__dirname, 'database.json'));
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(path.join(__dirname, 'database.json'), JSON.stringify(data, null, 2));
};

// --- API PROSES LOGIN ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, role: user.role });
    } else {
        res.json({ success: false, message: "Username atau password salah." });
    }
});

// --- API READ BUKU ---
app.get('/api/buku', (req, res) => {
    const db = readDB();
    res.json(db.buku);
});

// --- API CREATE BUKU --
app.post('/api/buku', (req, res) => {
    const { bookCode, bookTitle, bookAuthor, bookCategory, bookStock, bookLocation, bookStatus, bookSynopsis } = req.body;
    const db = readDB();
    
    if (db.buku.some(b => b.kode_buku.toLowerCase() === bookCode.toLowerCase())) {
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
    
    db.buku.push(newBook);
    writeDB(db);
    res.json({ success: true, message: "Buku berhasil ditambahkan!" });
});

// --- API DELETE BUKU ---
app.delete('/api/buku/:id', (req, res) => {
    const idBuku = parseInt(req.params.id);
    const db = readDB();
    
    db.buku = db.buku.filter(b => b.id_buku !== idBuku);
    writeDB(db);
    res.json({ success: true, message: "Buku berhasil dihapus!" });
});

// Menampilkan halaman login saat mengakses domain utama Vercel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Backend berjalan di http://localhost:${PORT}`);
    console.log(`Buka browser di: http://localhost:${PORT}/login.html`);
    console.log(`=======================================================`);
});
