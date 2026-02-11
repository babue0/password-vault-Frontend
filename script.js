const API_URL = "http://localhost:8080/api";
let currentUser = null;

// === FUNÇÃO MÁGICA DE LIMPEZA ===
function clearForms() {
  // Limpa todos os inputs da tela
  document.querySelectorAll("input").forEach((input) => (input.value = ""));
}

// === NAVEGAÇÃO ENTRE TELAS ===
function showRegister() {
  clearForms(); // Limpa tudo antes de mostrar
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("register-section").classList.remove("hidden");
}

function showLogin() {
  clearForms(); // Limpa tudo antes de mostrar
  document.getElementById("register-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

function toggleModal() {
  // Se for abrir o modal, limpa os campos dele primeiro
  const modal = document.getElementById("add-modal");
  if (modal.classList.contains("hidden")) {
    document.getElementById("new-service").value = "";
    document.getElementById("new-username").value = "";
    document.getElementById("new-password").value = "";
  }
  modal.classList.toggle("hidden");
}

// === LÓGICA DE NEGÓCIO ===

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
        masterPassword: password, // IMPORTANTE: Deve bater com o Java (User.java)
      }),
    });

    if (response.ok) {
      alert("Account created! Please login.");
      showLogin();
    } else {
      // Tenta ler a mensagem de erro do Java
      const errorText = await response.text();
      alert("Error: " + errorText);
    }
  } catch (error) {
    console.error("Erro ao registrar:", error);
    alert("Failed to connect to server. Is Backend running?");
  }
}

async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) return;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, masterPassword: password }),
    });

    if (response.ok) {
      currentUser = await response.json();

      // Troca de tela
      document.getElementById("login-section").classList.add("hidden");
      document.getElementById("dashboard-section").classList.remove("hidden");

      loadCredentials(); // Carrega os dados
    } else {
      alert("Invalid username or password!");
    }
  } catch (error) {
    console.error("Erro ao logar:", error);
    alert("Connection failed.");
  }
}

function logout() {
  currentUser = null;
  clearForms(); // Limpa tudo ao sair
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("login-section").classList.remove("hidden");
}

// === CREDENCIAIS ===

async function loadCredentials() {
  const listDiv = document.getElementById("password-list");
  listDiv.innerHTML = '<p style="text-align:center">Loading...</p>';

  try {
    const response = await fetch(`${API_URL}/credentials/${currentUser.id}`);
    const credentials = await response.json();

    listDiv.innerHTML = ""; // Limpa o loading

    if (credentials.length === 0) {
      listDiv.innerHTML =
        '<p style="text-align:center; color:#9ca3af;">No passwords saved yet.</p>';
      return;
    }

    credentials.forEach((cred) => {
      const card = document.createElement("div");
      card.className = "card-item";
      card.innerHTML = `
                <strong>${cred.serviceName}</strong>
                <p>User: ${cred.username}</p>
                <p>Pass: <code>${cred.password}</code></p>
            `;
      listDiv.appendChild(card);
    });
  } catch (error) {
    console.error(error);
    listDiv.innerHTML = '<p style="color:red">Error loading data.</p>';
  }
}

async function saveCredential() {
  const service = document.getElementById("new-service").value;
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;

  if (!service || !username || !password) {
    alert("Fill all fields!");
    return;
  }

  try {
    await fetch(`${API_URL}/credentials/${currentUser.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceName: service,
        username: username,
        password: password,
      }),
    });

    toggleModal(); // Fecha modal
    loadCredentials(); // Recarrega lista
  } catch (error) {
    alert("Error saving password");
  }
}
