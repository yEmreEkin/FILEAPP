let token = "";
let currentUserId = null;

// E-posta formatını kontrol et
function isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

// Kayıt Ol
function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!isValidEmail(username)) {
        alert("Lütfen geçerli bir e-posta adresi girin.");
        return;
    }

    fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {
    if(data.detail) {
        alert("Hata: " + data.detail);
    } else {
        alert(data.message || "Kayıt başarılı");
    }
})

        .catch(err => console.error(err));
}

// Giriş Yap
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!isValidEmail(username)) {
        alert("Lütfen geçerli bir e-posta adresi girin.");
        return;
    }

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.access_token) {
                token = data.access_token;
                getCurrentUser();
            } else {
                alert("Kullanıcı bulunamadı veya şifre hatalı!");
            }
            
        })
        
        .catch(err => console.error(err));
        


}



// Mevcut kullanıcı bilgisi
function getCurrentUser() {
    fetch("http://localhost:8000/me", {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(user => {
            console.log("Kullanıcı bilgisi:", user); // ✨ burayı ekle
            currentUserId = user.id;
            document.getElementById("auth-section").style.display = "none";
            document.getElementById("file-section").style.display = "block";
            document.getElementById("userIdDisplay").innerText = `Kullanıcı ID'niz: ${currentUserId}`;
            getMyFiles();
            getSharedFiles();
        });
}

// Dosya Yükle
function upload() {
    const fileInput = document.getElementById("uploadFile").files[0];
    const formData = new FormData();
    formData.append("uploaded_file", fileInput);

    fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            alert("Dosya yüklendi!");
            getMyFiles();
        });
}

// Dosya Gönder
function sendFile() {
    const fileInput = document.getElementById("uploadFile").files[0];
    const receiverId = Number(document.getElementById("receiverId").value);

    if (!fileInput) {
        alert("Lütfen önce dosya seçin!");
        return;
    }

    if (isNaN(receiverId) || receiverId <= 0) {
        alert("Lütfen geçerli bir alıcı ID girin!");
        return;
    }

    const formData = new FormData();
    formData.append("uploaded_file", fileInput);

    fetch(`http://localhost:8000/sendfile?receiver_id=${receiverId}`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert("Dosya gönderildi!");
        getMyFiles();
        getSharedFiles();
    })
    .catch(err => {
        alert("Dosya gönderilirken hata oluştu!");
        console.error(err);
    });
}


// Benim Dosyalarım
function getMyFiles() {
    fetch("http://localhost:8000/myfiles", {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(files => {
            const list = document.getElementById("myFilesList");
            list.innerHTML = "";
            files.forEach(file => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${file.filename}
                    <button onclick="downloadFile(${file.id})">Aç</button>
                    <button onclick="prepareUpdate(${file.id})">Güncelle</button>
                    <button onclick="deleteFile(${file.id})">Sil</button>
                `;
                list.appendChild(li);
            });
        });
}

// Paylaşılan Dosyalar
function getSharedFiles() {
    fetch("http://localhost:8000/shared-with-me", {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("sharedWithMeList");
            list.innerHTML = "";
            data.shared_files.forEach(file => {
                const li = document.createElement("li");
                li.innerHTML = `
                    ${file.filename} (gönderen: ${file.from_user})
                    <button onclick="downloadFile(${file.id})">Aç</button>
                `;
                list.appendChild(li);
            });
        });
}

// Dosya Sil
function deleteFile(id) {
    fetch(`http://localhost:8000/files/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            getMyFiles();
        });
}

// Dosya Aç
function downloadFile(id) {
    window.open(`http://localhost:8000/files/${id}`, "_blank");
}

// Dosya Güncelleme
function prepareUpdate(id) {
    const fileInput = document.getElementById("uploadFile").files[0];
    if (!fileInput) {
        alert("Lütfen önce yukarıdan bir dosya seçin!");
        return;
    }

    const formData = new FormData();
    formData.append("uploaded_file", fileInput);

    fetch(`http://localhost:8000/files/${id}`, {
        method: "PUT",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            alert("Dosya güncellendi!");
            getMyFiles();
        });
}
