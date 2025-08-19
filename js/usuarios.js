import {
  fetchUsers,
  cadastrarUsuario,
  atualizarUsuario,
  excluirUsuario,
} from "/services/usuariosService";

// --- Variáveis Globais ---
const usuariosPorPagina = 6;
let paginaAtual = 1;
let todosOsUsuarios = [];
let idUsuarioEditando = null;
let idParaExcluir = null;

const getRole = () => localStorage.getItem("roleUser");

// --- Seleção de Elementos do DOM ---
const tableBody = document.querySelector("#users-table tbody");
const paginacaoContainer = document.getElementById("pagination");
const searchInput = document.getElementById("search-input");
const mensagemErro = document.getElementById("mensagem-erro");
const modalOverlay = document.getElementById("modal-overlay");
const modalCadastrar = document.getElementById("modal-cadastrar");
const modalAtualizar = document.getElementById("modal-atualizar");
const modalCadastrando = document.getElementById("modal-cadastrando");
const modalAtualizando = document.getElementById("modal-atualizando");
const modalConfirmando = document.getElementById("modal-confirmando");
const modalDeletando = document.getElementById("modal-deletando");
const formCadastrar = document.getElementById("form-cadastrar");
const formAtualizar = document.getElementById("form-atualizar");
const registerNameInput = document.getElementById("register-name");
const registerEmailInput = document.getElementById("register-email");
const registerPasswordInput = document.getElementById("register-password");
const registerPermissionInput = document.getElementById("register-permission");
const updateNameInput = document.getElementById("update-name");
const updateEmailInput = document.getElementById("update-email");
const updatePasswordInput = document.getElementById("update-password");
const updatePermissionInput = document.getElementById("update-permission");
const addUserBtn = document.getElementById("add-user-btn");
const cancelarBtns = document.querySelectorAll(".btn-secondary");
const fecharBtns = document.querySelectorAll(".close-modal-btn");
const confirmDeleteBtn = modalConfirmando.querySelector(".btn-primary");
const toggleNav = document.getElementById("toggle-nav");
const nav = document.getElementById("navbar");
const profileButton = document.getElementById("profile-button");
const profileModal = document.getElementById("profile-modal");
const name = document.querySelector(".name");
const email = document.querySelector(".email");
const role = document.querySelector(".role");
const logoutButton = document.getElementById("logout-button");
const iconModal = document.getElementById("icon_modal");
const textModal = document.getElementById("text_modal");

// --- Funções de Renderização ---
const renderTable = (usuariosParaExibir, pagina = 1) => {
  tableBody.innerHTML = "";

  const inicio = (pagina - 1) * usuariosPorPagina;
  const fim = inicio + usuariosPorPagina;
  const usuariosPaginados = usuariosParaExibir.slice(inicio, fim);

  if (usuariosPaginados.length === 0 && pagina > 1) {
    paginaAtual = Math.max(1, paginaAtual - 1);
    renderTable(usuariosParaExibir, paginaAtual);
    return;
  }

  usuariosPaginados.forEach((user) => {
    const tr = tableBody.insertRow();
    tr.innerHTML = `
        <td data-label="Nome">${user.name}</td>
        <td data-label="Email"><div class="editable-cell" contenteditable="true">${
          user.email
        }</div></td>
        <td data-label="Permissão">${
          user.role === "ADMIN" ? "Usuário Editor" : "Usuário Leitor"
        }</td>
        <td data-label="Ações">
          <button class="action-btn edit-btn" data-id="${user.id}">
            <span class="material-icons-outlined">edit</span>
          </button>
          <button class="action-btn delete-btn" data-id="${user.id}">
            <span class="material-icons-outlined">delete</span>
          </button>
        </td>
      `;
  });

  if (usuariosParaExibir.length === 0) {
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Nenhum usuário encontrado.";
    paginacaoContainer.innerHTML = "";
  } else {
    mensagemErro.style.display = "none";
    renderPaginacao(usuariosParaExibir);
  }
};

const renderPaginacao = (usuarios) => {
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);
  paginacaoContainer.innerHTML = "";

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "Anterior";
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.classList.add("page-btn");
  btnAnterior.addEventListener("click", () => {
    paginaAtual--;
    renderTable(usuarios, paginaAtual);
  });

  paginacaoContainer.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === paginaAtual) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaAtual = i;
      renderTable(usuarios, paginaAtual);
    });
    paginacaoContainer.appendChild(btn);
  }

  const btnProximo = document.createElement("button");
  btnProximo.innerText = "Próximo";
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.classList.add("page-btn");
  btnProximo.addEventListener("click", () => {
    paginaAtual++;
    renderTable(usuarios, paginaAtual);
  });
  paginacaoContainer.appendChild(btnProximo);
};

// --- Funções de Modal ---
const openModal = (modalElement) => {
  modalOverlay.classList.add("is-open");
  modalElement.classList.add("is-open");
};

const closeModal = (modalElement) => {
  modalElement.classList.remove("is-open");
  modalOverlay.classList.remove("is-open");
  idUsuarioEditando = null;
  idParaExcluir = null;
  formCadastrar.reset();
  formAtualizar.reset();
};

// --- Função Principal de Carregamento ---
const carregarUsuarios = async () => {
  try {
    todosOsUsuarios = await fetchUsers();

    const usuarioLogin = todosOsUsuarios.find(
      (u) => u.email === localStorage.getItem("loginEmail")
    );

    if (usuarioLogin) {
      localStorage.setItem("nameUser", usuarioLogin.name);
      localStorage.setItem("emailUser", usuarioLogin.email);
      localStorage.setItem("roleUser", usuarioLogin.role);
    }

    renderTable(todosOsUsuarios, paginaAtual);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Erro ao carregar usuários.";
  }
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", async () => {
  await carregarUsuarios();

  name.textContent = localStorage.getItem("nameUser");
  email.textContent = localStorage.getItem("emailUser");
  getRole() === "ADMIN"
    ? (role.textContent = "Usuário Editor")
    : (role.textContent = "Usuário Leitor");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredUsers = todosOsUsuarios.filter((user) => {
      const roleFormatted =
        user.role === "ADMIN" ? "Usuário Editor" : "Usuário Leitor";
      return (
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        roleFormatted.toLowerCase().includes(searchTerm)
      );
    });
    paginaAtual = 1;
    renderTable(filteredUsers, paginaAtual);
  });

  logoutButton.addEventListener("click", (event) => {
    localStorage.removeItem("token");
    localStorage.removeItem("nameUser");
    localStorage.removeItem("emailUser");
    localStorage.removeItem("roleUser");
    window.location.href = "/index.html";
  });

  addUserBtn.addEventListener("click", () => {
    if (getRole() !== "ADMIN") return;
    openModal(modalCadastrar);
  });

  cancelarBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const modal = event.target.closest(".modal");
      closeModal(modal);
    });
  });

  fecharBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const modal = event.target.closest(".modal");
      closeModal(modal);
    });
  });

  // --- Formulário de Cadastro ---

  registerNameInput.addEventListener("input", () => {
    if (
      registerNameInput.value.trim().length < 3 ||
      registerNameInput.value.trim().length > 30
    ) {
      registerNameInput.setCustomValidity("Por favor, insira um nome válido.");
    } else {
      registerNameInput.setCustomValidity("");
    }
  });

  registerEmailInput.addEventListener("input", () => {
    if (
      registerEmailInput.validity.typeMismatch ||
      registerEmailInput.value.trim().length < 7 ||
      registerEmailInput.value.trim().length > 50
    ) {
      registerEmailInput.setCustomValidity(
        "Por favor, insira um email válido."
      );
    } else {
      registerEmailInput.setCustomValidity("");
    }
  });

  registerPasswordInput.addEventListener("input", () => {
    if (registerPasswordInput.value.trim().length < 8) {
      registerPasswordInput.setCustomValidity(
        "A senha deve possui no mínimo 8 dígitos"
      );
    } else if (registerPasswordInput.value.trim().length > 30) {
      registerPasswordInput.setCustomValidity(
        "Por favor, insira uma senha válida."
      );
    } else {
      registerPasswordInput.setCustomValidity("");
    }
  });

  formCadastrar.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!registerNameInput.value.trim()) {
      registerNameInput.setCustomValidity("O nome é obrigatório.");
      registerNameInput.reportValidity();
      return;
    }

    if (!registerEmailInput.value.trim()) {
      registerEmailInput.setCustomValidity("O email é obrigatório.");
      registerEmailInput.reportValidity();
      return;
    }

    if (!registerPasswordInput.value.trim()) {
      registerPasswordInput.setCustomValidity("A senha é obrigatória.");
      registerPasswordInput.reportValidity();
      return;
    }

    if (
      registerNameInput.value.trim().length < 3 ||
      registerNameInput.value.trim().length > 30
    ) {
      registerNameInput.setCustomValidity("Por favor, insira um nome válido.");
      registerNameInput.reportValidity();
      return;
    }

    if (
      registerEmailInput.validity.typeMismatch ||
      registerEmailInput.value.trim().length < 7 ||
      registerEmailInput.value.trim().length > 50
    ) {
      registerEmailInput.setCustomValidity(
        "Por favor, insira um email válido."
      );
      registerEmailInput.reportValidity();
      return;
    }

    if (registerPasswordInput.value.trim().length < 8) {
      registerPasswordInput.setCustomValidity(
        "A senha deve possui no mínimo 8 dígitos"
      );
      registerPasswordInput.reportValidity();
      return;
    }

    if (registerPasswordInput.value.trim().length > 30) {
      registerPasswordInput.setCustomValidity(
        "Por favor, insira uma senha válida."
      );
      registerPasswordInput.reportValidity();
      return;
    }

    const nomeExistente = todosOsUsuarios.some(
      (usuario) =>
        usuario.name.toLowerCase() ===
        registerNameInput.value.trim().toLowerCase()
    );

    const emailExistente = todosOsUsuarios.some(
      (usuario) =>
        usuario.email.toLowerCase() ===
        registerEmailInput.value.trim().toLowerCase()
    );

    if (nomeExistente) {
      registerNameInput.setCustomValidity(
        "Já existe um usuário cadastrado com esse nome."
      );
      registerNameInput.reportValidity();
      return;
    }

    if (emailExistente) {
      registerEmailInput.setCustomValidity(
        "Já existe um usuário cadastrado com esse email."
      );
      registerEmailInput.reportValidity();
      return;
    }

    const newUser = {
      name: registerNameInput.value.trim(),
      email: registerEmailInput.value.trim(),
      password: registerPasswordInput.value.trim(),
      role: registerPermissionInput.value.trim(),
    };

    try {
      await cadastrarUsuario(newUser);
      closeModal(modalCadastrar);
      openModal(modalCadastrando);
      setTimeout(() => closeModal(modalCadastrando), 1500);
      await carregarUsuarios();
      searchInput.value = "";
      paginaAtual = 1;
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário.");
    }
  });

  updateNameInput.addEventListener("input", () => {
    if (
      updateNameInput.value.trim().length < 3 ||
      updateNameInput.value.trim().length > 30
    ) {
      updateNameInput.setCustomValidity("Por favor, insira um nome válido.");
    } else {
      updateNameInput.setCustomValidity("");
    }
  });

  updateEmailInput.addEventListener("input", () => {
    if (
      updateEmailInput.validity.typeMismatch ||
      updateEmailInput.value.trim().length < 7 ||
      updateEmailInput.value.trim().length > 50
    ) {
      updateEmailInput.setCustomValidity("Por favor, insira um email válido.");
    } else {
      updateEmailInput.setCustomValidity("");
    }
  });

  updatePasswordInput.addEventListener("input", () => {
    if (updatePasswordInput.value.trim().length < 8) {
      updatePasswordInput.setCustomValidity(
        "A senha deve possui no mínimo 8 dígitos"
      );
    } else if (updatePasswordInput.value.trim().length > 30) {
      updatePasswordInput.setCustomValidity(
        "Por favor, insira uma senha válida."
      );
    } else {
      updatePasswordInput.setCustomValidity("");
    }
  });

  formAtualizar.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (idUsuarioEditando === null) return;

    if (!updateNameInput.value.trim()) {
      updateNameInput.setCustomValidity("O nome é obrigatório.");
      updateNameInput.reportValidity();
      return;
    }

    if (!updateEmailInput.value.trim()) {
      updateEmailInput.setCustomValidity("O email é obrigatório.");
      updateEmailInput.reportValidity();
      return;
    }

    if (!updatePasswordInput.value.trim()) {
      updatePasswordInput.setCustomValidity("A senha é obrigatória.");
      updatePasswordInput.reportValidity();
      return;
    }

    if (
      updateNameInput.value.trim().length < 3 ||
      updateNameInput.value.trim().length > 30
    ) {
      updateNameInput.setCustomValidity("Por favor, insira um nome válido.");
      updateNameInput.reportValidity();
      return;
    }

    if (
      updateEmailInput.validity.typeMismatch ||
      updateEmailInput.value.trim().length < 7 ||
      updateEmailInput.value.trim().length > 50
    ) {
      updateEmailInput.setCustomValidity("Por favor, insira um email válido.");
      updateEmailInput.reportValidity();
      return;
    }

    if (updatePasswordInput.value.trim().length < 8) {
      updatePasswordInput.setCustomValidity(
        "A senha deve possuir no mínimo 8 dígitos"
      );
      updatePasswordInput.reportValidity();
      return;
    }

    if (updatePasswordInput.value.trim().length > 30) {
      updatePasswordInput.setCustomValidity(
        "Por favor, insira uma senha válida."
      );
      updatePasswordInput.reportValidity();
      return;
    }

    const nomeExistente = todosOsUsuarios.some(
      (usuario) =>
        usuario.id !== idUsuarioEditando &&
        usuario.name.toLowerCase() ===
          updateNameInput.value.trim().toLowerCase()
    );

    const emailExistente = todosOsUsuarios.some(
      (usuario) =>
        usuario.id !== idUsuarioEditando &&
        usuario.email.toLowerCase() ===
          updateEmailInput.value.trim().toLowerCase()
    );

    if (nomeExistente) {
      updateNameInput.setCustomValidity(
        "Já existe um usuário cadastrado com esse nome."
      );
      updateNameInput.reportValidity();
      return;
    }

    if (emailExistente) {
      updateEmailInput.setCustomValidity(
        "Já existe um usuário cadastrado com esse email."
      );
      updateEmailInput.reportValidity();
      return;
    }

    const updatedUser = {
      name: updateNameInput.value.trim(),
      email: updateEmailInput.value.trim(),
      role: updatePermissionInput.value.trim(),
    };

    try {
      await atualizarUsuario(idUsuarioEditando, updatedUser);
      closeModal(modalAtualizar);
      openModal(modalAtualizando);
      setTimeout(() => closeModal(modalAtualizando), 1500);
      await carregarUsuarios();
      searchInput.value = "";
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar usuário.");
    }
  });

  tableBody.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      if (getRole() !== "ADMIN") return;

      idUsuarioEditando = parseInt(editBtn.dataset.id, 10);
      const userToEdit = todosOsUsuarios.find(
        (u) => u.id === idUsuarioEditando
      );

      const usuarioLogin = todosOsUsuarios.find(
        (u) => u.email === localStorage.getItem("loginEmail")
      );

      if (usuarioLogin.id === idUsuarioEditando) {
        iconModal.style.color = "red";
        iconModal.textContent = "cancel";
        textModal.textContent = "Você não pode se editar.";
        openModal(modalDeletando);
        return;
      }

      if (userToEdit) {
        updateNameInput.value = userToEdit.name;
        updateEmailInput.value = userToEdit.email;
        updatePasswordInput.value = "";
        updatePermissionInput.value = userToEdit.role;
        openModal(modalAtualizar);
      }
    }

    if (deleteBtn) {
      if (getRole() !== "ADMIN") return;

      idParaExcluir = parseInt(deleteBtn.dataset.id, 10);

      openModal(modalConfirmando);
    }
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (idParaExcluir !== null) {
      const usuarioLogin = todosOsUsuarios.find(
        (u) => u.email === localStorage.getItem("loginEmail")
      );
      if (usuarioLogin.id === idParaExcluir) {
        iconModal.style.color = "red";
        iconModal.textContent = "cancel";
        textModal.textContent = "Você não pode se excluir.";
        closeModal(modalConfirmando);
        openModal(modalDeletando);
        searchInput.value = "";
      } else {
        try {
          await excluirUsuario(idParaExcluir);
          iconModal.style.color = "rgb(24, 209, 24)";
          iconModal.textContent = "check_circle";
          textModal.textContent = "Usuário excluído!";
          closeModal(modalConfirmando);
          openModal(modalDeletando);
          setTimeout(() => closeModal(modalDeletando), 1500);
          await carregarUsuarios();
          searchInput.value = "";
        } catch (error) {
          console.error("Erro ao excluir usuário:", error);
          alert("Erro ao excluir usuário.");
        }
      }
    }
  });

  if (toggleNav && nav) {
    toggleNav.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (
        nav.classList.contains("active") &&
        !nav.contains(e.target) &&
        e.target !== toggleNav
      ) {
        nav.classList.remove("active");
      }
    });
  }

  if (profileButton && profileModal) {
    profileButton.addEventListener("click", () => {
      profileModal.classList.toggle("visible");
    });
    document.addEventListener("click", (e) => {
      if (
        !profileButton.contains(e.target) &&
        !profileModal.contains(e.target)
      ) {
        profileModal.classList.remove("visible");
      }
    });
  }
});
