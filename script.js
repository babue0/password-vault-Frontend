const API_URL = "https://password-vault-1ynf.onrender.com/api";
let currentUser = null;

// === VERIFICAÇÃO INICIAL (SEGURANÇA MÁXIMA) ===
// Sempre que a página carrega, forçamos o logout e limpamos tudo.
window.onload = function () {
  currentUser = null;
  localStorage.removeItem("user"); // Remove qualquer rastro antigo
  clearForms();
  showLogin(); // Força a tela de login
};

// === NAVEGAÇÃO E LIMPEZA ===
function clearForms() {
  document.querySelectorAll("input").forEach((input) => (input.value = ""));
}

function showRegister() {
  clearForms();
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
  document.getElementById("dashboard-section").classList.add("hidden");
}

function showLogin() {
  clearForms();
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

function showDashboard() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  loadCredentials();
}

function toggleModal() {
  const modal = document.getElementById("add-modal");
  if (modal.classList.contains("hidden")) {
    // Limpa campos antes de abrir
    document.getElementById("new-service").value = "";
    document.getElementById("new-username").value = "";
    document.getElementById("new-password").value = "";
  }
  modal.classList.toggle("hidden");
}

// === AUTH SYSTEM ===

async function register() {
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;

  if (!username || !password) {
    alert("Please fill in all fields!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        masterPassword: password,
      }),
    });

    if (response.ok) {
      alert("Account created! Please login.");
      showLogin();
    } else {
      const errorText = await response.text();
      alert("Error: " + errorText);
    }
  } catch (error) {
    console.error("Register error:", error);
    alert("Failed to connect to server.");
  }
}

async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        masterPassword: password,
      }),
    });

    if (response.ok) {
      currentUser = await response.json();
      // NOTA: Removida a linha que salvava no localStorage.
      // Agora, se der F5 ou fechar a aba, o usuário é deslogado.
      showDashboard();
    } else {
      alert("Invalid credentials!");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Connection failed.");
  }
}

function logout() {
  currentUser = null;
  showLogin();
}

// === CREDENTIALS (CRUD) ===

async function loadCredentials() {
  if (!currentUser) return;

  const listDiv = document.getElementById("password-list");
  listDiv.innerHTML = '<p style="text-align:center">Loading...</p>';

  try {
    const response = await fetch(`${API_URL}/credentials/${currentUser.id}`);

    if (response.ok) {
      const credentials = await response.json();
      listDiv.innerHTML = "";

      if (credentials.length === 0) {
        listDiv.innerHTML =
          '<p style="text-align:center; color:#9ca3af;">No passwords saved yet.</p>';
        return;
      }

      credentials.forEach((cred) => {
        const card = document.createElement("div");
        card.className = "card-item";

        const displayService =
          cred.serviceName || cred.url || cred.service || "No Name";

        card.innerHTML = `
            <div class="card-info">
                <strong>${displayService}</strong>
                <p>User: ${cred.username}</p>
                <p>Pass: <code>${cred.password}</code></p>
            </div>
            
            <div class="delete-section">
                <button id="btn-trash-${cred.id}" onclick="showConfirm(${cred.id})" class="btn-delete" title="Delete">
                    🗑️
                </button>

                <div id="confirm-area-${cred.id}" class="confirm-box hidden">
                    <span class="confirm-text">Sure?</span>
                    <button onclick="executeDelete(${cred.id})" class="btn-yes" title="Delete Forever">✔</button>
                    <button onclick="cancelDelete(${cred.id})" class="btn-no" title="Cancel">✖</button>
                </div>
            </div>
        `;
        listDiv.appendChild(card);
      });
    } else {
      listDiv.innerHTML = "<p>Error loading list.</p>";
    }
  } catch (error) {
    console.error(error);
    listDiv.innerHTML = "<p>Connection error.</p>";
  }
}

// --- FUNÇÕES DE CONTROLE VISUAL (DELETE) ---

function showConfirm(id) {
  document.getElementById(`btn-trash-${id}`).classList.add("hidden");
  document.getElementById(`confirm-area-${id}`).classList.remove("hidden");
}

function cancelDelete(id) {
  document.getElementById(`confirm-area-${id}`).classList.add("hidden");
  document.getElementById(`btn-trash-${id}`).classList.remove("hidden");
}

async function executeDelete(id) {
  try {
    const response = await fetch(`${API_URL}/credentials/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadCredentials();
    } else {
      alert("Error deleting credential.");
    }
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to connect to server.");
  }
}

// --- SAVE CREDENTIAL ---

async function saveCredential() {
  const serviceVal = document.getElementById("new-service").value;
  const usernameVal = document.getElementById("new-username").value;
  const passwordVal = document.getElementById("new-password").value;

  if (!serviceVal || !usernameVal || !passwordVal) {
    alert("Fill all fields!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/credentials/${currentUser.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: serviceVal,
        username: usernameVal,
        password: passwordVal,
      }),
    });

    if (response.ok) {
      toggleModal();
      loadCredentials();
    } else {
      alert("Error saving. Check console.");
    }
  } catch (error) {
    console.error(error);
    alert("Failed to save.");
  }
}
