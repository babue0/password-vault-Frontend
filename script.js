// ✅ URL DO SEU BACKEND NO RENDER
const API_URL = "https://password-vault-1ynf.onrender.com/api";

// --- LOGIN SYSTEM ---

async function login() {
  const usernameInput = document.getElementById("login-username").value;
  const passwordInput = document.getElementById("login-password").value;

  if (!usernameInput || !passwordInput) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });

    if (response.ok) {
      const user = await response.json();
      localStorage.setItem("user", JSON.stringify(user));
      showDashboard();
    } else {
      alert("Invalid credentials ❌");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Server error. Check console.");
  }
}

async function register() {
  const usernameInput = document.getElementById("reg-username").value;
  const passwordInput = document.getElementById("reg-password").value;

  if (!usernameInput || !passwordInput) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput,
      }),
    });

    if (response.ok) {
      alert("Account created! Please login.");
      showLogin();
    } else {
      alert("Error creating account.");
    }
  } catch (error) {
    console.error("Register error:", error);
    alert("Server error.");
  }
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

// --- NAVIGATION ---

function showRegister() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

function showDashboard() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  loadCredentials();
}

// Check validation on load
window.onload = function () {
  const user = localStorage.getItem("user");
  if (user) {
    showDashboard();
  }
};

// --- CREDENTIALS CRUD ---

async function loadCredentials() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  try {
    const response = await fetch(`${API_URL}/credentials/${user.id}`);
    if (response.ok) {
      const credentials = await response.json();
      renderCredentials(credentials);
    } else {
      document.getElementById("password-list").innerHTML =
        "<p>Error loading data.</p>";
    }
  } catch (error) {
    console.error("Load error:", error);
  }
}

function renderCredentials(credentials) {
  const list = document.getElementById("password-list");
  list.innerHTML = "";

  if (credentials.length === 0) {
    list.innerHTML =
      "<p style='text-align:center; color:#9ca3af;'>No passwords saved yet.</p>";
    return;
  }

  credentials.forEach((cred) => {
    const item = document.createElement("div");
    item.className = "card-item";

    // Passa os dados para a função de editar
    item.innerHTML = `
            <div class="card-info">
                <strong>${cred.service}</strong>
                <p>User: ${cred.username}</p>
                <p>Pass: <code>${cred.password}</code></p>
            </div>
            <button onclick="openEditModal(${cred.id}, '${cred.service}', '${cred.username}', '${cred.password}')" class="btn-edit">
                Edit ✏️
            </button>
        `;
    list.appendChild(item);
  });
}

// --- MODAL & SAVE LOGIC ---

// Abre modal para CRIAR (Limpo)
function toggleModal() {
  const modal = document.getElementById("add-modal");
  if (modal.classList.contains("hidden")) {
    // Limpa tudo para criar novo
    document.getElementById("edit-id").value = "";
    document.getElementById("new-service").value = "";
    document.getElementById("new-username").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("modal-title").innerText = "Add New Credential";
    modal.classList.remove("hidden");
  } else {
    modal.classList.add("hidden");
  }
}

// Abre modal para EDITAR (Preenchido)
function openEditModal(id, service, username, password) {
  document.getElementById("edit-id").value = id;
  document.getElementById("new-service").value = service;
  document.getElementById("new-username").value = username;
  document.getElementById("new-password").value = password;

  document.getElementById("modal-title").innerText = "Edit Credential";
  document.getElementById("add-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("add-modal").classList.add("hidden");
}

async function saveCredential() {
  const id = document.getElementById("edit-id").value; // ID escondido
  const service = document.getElementById("new-service").value;
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;
  const user = JSON.parse(localStorage.getItem("user"));

  if (!service || !username || !password) {
    alert("Please fill all fields");
    return;
  }

  const headers = { "Content-Type": "application/json" };
  // JSON agora usa 'service'
  const body = JSON.stringify({ service, username, password });

  try {
    let response;

    if (id) {
      // SE TEM ID, É EDIÇÃO (PUT)
      response = await fetch(`${API_URL}/credentials/${id}`, {
        method: "PUT",
        headers: headers,
        body: body,
      });
    } else {
      // SE NÃO TEM ID, É CRIAÇÃO (POST)
      response = await fetch(`${API_URL}/credentials/${user.id}`, {
        method: "POST",
        headers: headers,
        body: body,
      });
    }

    if (response.ok) {
      closeModal();
      loadCredentials(); // Recarrega a lista
    } else {
      alert("Error saving data");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to connect to server");
  }
}
