const API_URL = "https://password-vault-1ynf.onrender.com/api";
let currentUser = null;

// === VERIFICAÇÃO INICIAL (Ao abrir a página) ===
window.onload = function () {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    showDashboard();
  }
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

// === AUTH SYSTEM (Usando masterPassword) ===

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
        masterPassword: password, // ✅ Correção para Backend Antigo
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
        masterPassword: password, // ✅ Correção para Backend Antigo
      }),
    });

    if (response.ok) {
      currentUser = await response.json();
      // Salva no navegador para não deslogar ao atualizar
      localStorage.setItem("user", JSON.stringify(currentUser));
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
  localStorage.removeItem("user"); // Limpa sessão
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

        // NOTA: Se você fez rollback, o backend provavelmente usa 'url' e não 'service'
        // Se não aparecer o nome do site, troque cred.url por cred.service abaixo
        card.innerHTML = `
                    <strong>${cred.url || cred.service || "No Name"}</strong>
                    <p>User: ${cred.username}</p>
                    <p>Pass: <code>${cred.password}</code></p>
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
