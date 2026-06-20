const demoMembers = [
    { id: 1, code: "AGT-001", name: "Waterson Melloney", email: "waterson@email.com", phone: "081234567890", job: "Pedagang", address: "Gry Street No. 12", status: "Aktif" },
    { id: 2, code: "AGT-002", name: "Siti Aminah", email: "siti.aminah@email.com", phone: "085612345678", job: "Mahasiswa", address: "Jl. Merpati No. 45", status: "Aktif" },
    { id: 3, code: "AGT-003", name: "Budi Prakoso", email: "budiprakoso@email.com", phone: "081198765432", job: "Karyawan Swasta", address: "Jl. Anggrek No. 8", status: "Nonaktif" }
];

function getMemberData() {
    return JSON.parse(localStorage.getItem("members")) || demoMembers;
}

function saveMemberData(data) {
    localStorage.setItem("members", JSON.stringify(data));
}

// Render Tabel Anggota
function renderMemberTable() {
    const tableBody = document.getElementById("memberTableBody");
    if (!tableBody) return;

    const searchValue = document.getElementById("memberSearch").value.toLowerCase();
    const statusValue = document.getElementById("statusFilter").value;
    const members = getMemberData();

    const filteredMembers = members.filter(member => {
        const searchableText = `${member.name} ${member.code} ${member.email}`.toLowerCase();
        const matchSearch = searchableText.includes(searchValue);
        const matchStatus = !statusValue || member.status === statusValue;
        return matchSearch && matchStatus;
    });

    if (filteredMembers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="text-muted">
                        <i class="fa-solid fa-users-slash mb-3" style="font-size: 48px; color: #cbd5e1;"></i>
                        <h5 class="fw-bold" style="color: var(--primary);">Anggota tidak ditemukan</h5>
                        <p class="mb-0">Coba kata kunci pencarian yang lain.</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = filteredMembers.map(member => {
        const statusBadgeColor = member.status === "Aktif" ? "bg-success" : "bg-danger";
        
        return `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <div style="width: 45px; height: 45px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold" style="color: var(--primary);">${member.name}</h6>
                        <small class="text-muted">${member.code}</small>
                    </div>
                </div>
            </td>
            <td>
                <div style="font-size: 0.9rem;">
                    <div><i class="fa-solid fa-envelope text-muted me-1"></i> ${member.email}</div>
                    <div><i class="fa-solid fa-phone text-muted me-1"></i> ${member.phone}</div>
                </div>
            </td>
            <td>${member.job}</td>
            <td><small class="text-muted">${member.address}</small></td>
            <td><span class="badge ${statusBadgeColor} rounded-pill">${member.status}</span></td>
            <td class="text-end action-buttons">
                <button type="button" class="btn btn-light text-danger" onclick="deleteMember(${member.id})" title="Hapus Anggota">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`;
    }).join("");
}

// Fungsi Hapus Anggota
window.deleteMember = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
        const members = getMemberData();
        const nextMembers = members.filter(m => m.id !== id);
        saveMemberData(nextMembers);
        renderMemberTable();
    }
};

// Fungsi Live Preview
function updateMemberPreview() {
    const nameVal = document.getElementById("memberName").value || "Nama Lengkap";
    const codeVal = document.getElementById("memberCode").value || "ID Anggota";
    const jobVal = document.getElementById("memberJob").value || "Pekerjaan";
    const emailVal = document.getElementById("memberEmail").value || "Email";
    const phoneVal = document.getElementById("memberPhone").value || "No. Telp";
    const statusVal = document.getElementById("memberStatus").value || "Aktif";

    document.getElementById("previewName").innerText = nameVal;
    document.getElementById("previewCode").innerText = codeVal;
    document.getElementById("previewJob").innerText = jobVal;
    document.getElementById("previewEmail").innerText = emailVal;
    document.getElementById("previewPhone").innerText = phoneVal;
    
    const previewStatus = document.getElementById("previewStatus");
    previewStatus.innerText = statusVal;
    if(statusVal === "Aktif") {
        previewStatus.className = "badge bg-success rounded-pill mb-3";
    } else {
        previewStatus.className = "badge bg-danger rounded-pill mb-3";
    }
}

function handleMemberSubmit(e) {
    e.preventDefault();
    const inputCode = document.getElementById("memberCode").value.trim();
    const members = getMemberData();

    if (members.some(m => m.code.toLowerCase() === inputCode.toLowerCase())) {
        alert(`Maaf, ID Anggota "${inputCode}" sudah terdaftar!`);
        return;
    }

    const newMember = {
        id: Date.now(),
        code: inputCode,
        name: document.getElementById("memberName").value.trim(),
        email: document.getElementById("memberEmail").value.trim(),
        phone: document.getElementById("memberPhone").value.trim(),
        job: document.getElementById("memberJob").value.trim(),
        address: document.getElementById("memberAddress").value.trim(),
        status: document.getElementById("memberStatus").value
    };

    saveMemberData([...members, newMember]);
    alert("Anggota berhasil ditambahkan!");
    window.location.href = "daftar-anggota.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("memberSearch");
    if (searchInput) {
        renderMemberTable();
        searchInput.addEventListener("input", renderMemberTable);
        document.getElementById("statusFilter").addEventListener("change", renderMemberTable);
    }

    const form = document.getElementById("memberForm");
    if (form) {
        updateMemberPreview();
        form.addEventListener("input", updateMemberPreview);
        form.addEventListener("change", updateMemberPreview);
        form.addEventListener("submit", handleMemberSubmit);
    }
});