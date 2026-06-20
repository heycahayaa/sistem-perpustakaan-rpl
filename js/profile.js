// --- SCRIPT UNTUK PROFILE ADMIN ---
const formEditAdmin = document.getElementById('formEditAdmin');

if(formEditAdmin) {
    formEditAdmin.addEventListener('submit', function(e) {
        e.preventDefault(); // Mencegah reload halaman

        // Ambil nilai dari inputan
        const nama = document.getElementById('inputNamaAdmin').value;
        const email = document.getElementById('inputEmailAdmin').value;
        const telp = document.getElementById('inputTelpAdmin').value;
        const alamat = document.getElementById('inputAlamatAdmin').value;

        // Update teks di UI
        document.querySelector('.profile-name').innerText = nama;
        
        // Update data kontak & alamat (kita ambil elemen <p> berdasarkan isinya/urutannya)
        const pElements = document.querySelectorAll('.info-card p');
        // Asumsi urutan elemen <p> di info card admin: Jenis Kelamin (0), Tgl Lahir (1), Alamat (2), Email (3), No Telp (4)
        pElements[2].innerText = alamat;
        pElements[3].innerText = email;
        pElements[4].innerText = telp;

        // Tutup Modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditAdmin'));
        modal.hide();

        alert("Profil Admin berhasil diperbarui!");
    });
}

// --- SCRIPT UNTUK PROFILE ANGGOTA ---
const formEditAnggota = document.getElementById('formEditAnggota');

if(formEditAnggota) {
    formEditAnggota.addEventListener('submit', function(e) {
        e.preventDefault();

        const kerja = document.getElementById('inputKerjaAnggota').value;
        const email = document.getElementById('inputEmailAnggota').value;
        const telp = document.getElementById('inputTelpAnggota').value;
        const alamat = document.getElementById('inputAlamatAnggota').value;

        const pElements = document.querySelectorAll('.info-card p');
        // Asumsi urutan elemen <p> di info card anggota: Jenis Kelamin (0), Tgl Lahir (1), Pekerjaan (2), Alamat (3), Email (4), No Telp (5)
        pElements[2].innerText = kerja;
        pElements[3].innerText = alamat;
        pElements[4].innerText = email;
        pElements[5].innerText = telp;

        // Tutup Modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditAnggota'));
        modal.hide();

        alert("Profil Anggota berhasil diperbarui!");
    });
}