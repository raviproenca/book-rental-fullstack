// locatarios.js
import {
  fetchRenters,
  cadastrarLocatario,
  atualizarLocatario,
  excluirLocatario,
} from "/services/locatariosService.js";

// --- Variáveis Globais ---
const locatariosPorPagina = 6;
let paginaAtual = 1;
let todosOsLocatarios = [];
let idLocatarioEditando = null;
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
const registerCelularInput = document.getElementById("register-celular");
const registerEnderecoInput = document.getElementById("register-endereco");
const registerCpfInput = document.getElementById("register-cpf");
const updateNameInput = document.getElementById("update-name");
const updateEmailInput = document.getElementById("update-email");
const updateCelularInput = document.getElementById("update-celular");
const updateEnderecoInput = document.getElementById("update-endereco");
const updateCpfInput = document.getElementById("update-cpf");
const addLocatarioBtn = document.getElementById("add-user-btn");
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
const renderTable = (locatariosParaExibir, pagina = 1) => {
  tableBody.innerHTML = "";

  const inicio = (pagina - 1) * locatariosPorPagina;
  const fim = inicio + locatariosPorPagina;
  const locatariosPaginados = locatariosParaExibir.slice(inicio, fim);

  if (locatariosPaginados.length === 0 && pagina > 1) {
    paginaAtual = Math.max(1, paginaAtual - 1);
    renderTable(locatariosParaExibir, paginaAtual);
    return;
  }

  locatariosPaginados.forEach((locatario) => {
    const tr = tableBody.insertRow();
    tr.innerHTML = `
      <td data-label="Nome">${locatario.name}</td>
      <td data-label="Email"><div class="editable-cell" contenteditable="true">${locatario.email}</div></td>
      <td data-label="Celular">${locatario.telephone}</td>
      <td data-label="Endereço">${locatario.address}</td>
      <td data-label="CPF">${locatario.cpf}</td>
      <td data-label="Ações">
        <button class="action-btn edit-btn" data-id="${locatario.id}">
          <span class="material-icons-outlined">edit</span>
        </button>
        <button class="action-btn delete-btn" data-id="${locatario.id}">
          <span class="material-icons-outlined">delete</span>
        </button>
      </td>
    `;
  });

  if (locatariosParaExibir.length === 0) {
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Nenhum locatário encontrado.";
    paginacaoContainer.innerHTML = "";
  } else {
    mensagemErro.style.display = "none";
    renderPaginacao(locatariosParaExibir);
  }
};

const renderPaginacao = (locatarios) => {
  const totalPaginas = Math.ceil(locatarios.length / locatariosPorPagina);
  paginacaoContainer.innerHTML = "";

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "Anterior";
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.classList.add("page-btn");
  btnAnterior.addEventListener("click", () => {
    paginaAtual--;
    renderTable(locatarios, paginaAtual);
  });
  paginacaoContainer.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === paginaAtual) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaAtual = i;
      renderTable(locatarios, paginaAtual);
    });
    paginacaoContainer.appendChild(btn);
  }

  const btnProximo = document.createElement("button");
  btnProximo.innerText = "Próximo";
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.classList.add("page-btn");
  btnProximo.addEventListener("click", () => {
    paginaAtual++;
    renderTable(locatarios, paginaAtual);
  });
  paginacaoContainer.appendChild(btnProximo);
};

// --- Funções de Modal ---
const openModal = (modal) => {
  modalOverlay.classList.add("is-open");
  modal.classList.add("is-open");
};

const closeModal = (modal) => {
  modal.classList.remove("is-open");
  modalOverlay.classList.remove("is-open");
  idLocatarioEditando = null;
  idParaExcluir = null;
  formCadastrar.reset();
  formAtualizar.reset();
};

// --- Funções de Carregamento ---
const carregarLocatarios = async () => {
  try {
    todosOsLocatarios = await fetchRenters();
    renderTable(todosOsLocatarios, paginaAtual);
  } catch (error) {
    console.error("Erro ao carregar locatários:", error);
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Erro ao carregar locatários.";
  }
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", async () => {
  await carregarLocatarios();

  name.textContent = localStorage.getItem("nameUser");
  email.textContent = localStorage.getItem("emailUser");
  getRole() === "ADMIN"
    ? (role.textContent = "Usuário Editor")
    : (role.textContent = "Usuário Leitor");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredLocatarios = todosOsLocatarios.filter((locatario) => {
      return (
        locatario.name.toLowerCase().includes(searchTerm) ||
        locatario.email.toLowerCase().includes(searchTerm) ||
        locatario.telephone.toLowerCase().includes(searchTerm) ||
        locatario.address.toLowerCase().includes(searchTerm) ||
        locatario.cpf.toLowerCase().includes(searchTerm)
      );
    });
    paginaAtual = 1;
    renderTable(filteredLocatarios, paginaAtual);
  });

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("nameUser");
    localStorage.removeItem("emailUser");
    localStorage.removeItem("roleUser");
    window.location.href = "/index.html";
  });

  addLocatarioBtn.addEventListener("click", () => {
    if (getRole() !== "ADMIN") return;

    openModal(modalCadastrar);
  });

  cancelarBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
  );

  fecharBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
  );

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

  registerCelularInput.addEventListener("input", () => {
    if (
      registerCelularInput.value.trim().length < 11 ||
      registerCelularInput.value.trim().length > 16
    ) {
      registerCelularInput.setCustomValidity(
        "Por favor, insira um celular válido"
      );
    } else {
      registerCelularInput.setCustomValidity("");
    }
  });

  registerEnderecoInput.addEventListener("input", () => {
    if (
      registerEnderecoInput.value.trim().length < 3 ||
      registerEnderecoInput.value.trim().length > 50
    ) {
      registerEnderecoInput.setCustomValidity(
        "Por favor, insira um Endereco válido"
      );
    } else {
      registerEnderecoInput.setCustomValidity("");
    }
  });

  registerCpfInput.addEventListener("input", () => {
    if (
      registerCpfInput.value.trim().length < 11 ||
      registerCpfInput.value.trim().length > 14
    ) {
      registerCpfInput.setCustomValidity("Por favor, insira um CPF válido");
    } else {
      registerCpfInput.setCustomValidity("");
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
    if (!registerCelularInput.value.trim()) {
      registerCelularInput.setCustomValidity("O celular é obrigatório.");
      registerCelularInput.reportValidity();
      return;
    }
    if (!registerEnderecoInput.value.trim()) {
      registerEnderecoInput.setCustomValidity("O endereço é obrigatório.");
      registerEnderecoInput.reportValidity();
      return;
    }
    if (!registerCpfInput.value.trim()) {
      registerCpfInput.setCustomValidity("O CPF é obrigatório.");
      registerCpfInput.reportValidity();
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

    if (
      registerCelularInput.value.trim().length < 11 ||
      registerCelularInput.value.trim().length > 16
    ) {
      registerCelularInput.setCustomValidity(
        "Por favor, insira um celular válido"
      );
      registerCelularInput.reportValidity();
      return;
    }

    if (
      registerEnderecoInput.value.trim().length < 3 ||
      registerEnderecoInput.value.trim().length > 50
    ) {
      registerEnderecoInput.setCustomValidity(
        "Por favor, insira um Endereco válido"
      );
      registerEnderecoInput.reportValidity();
      return;
    }

    if (
      registerCpfInput.value.trim().length < 11 ||
      registerCpfInput.value.trim().length > 14
    ) {
      registerCpfInput.setCustomValidity("Por favor, insira um CPF válido");
      registerCpfInput.reportValidity();
      return;
    }

    const nomeExistente = todosOsLocatarios.some(
      (locatario) =>
        locatario.name.toLowerCase() ===
        registerNameInput.value.trim().toLowerCase()
    );

    const emailExistente = todosOsLocatarios.some(
      (locatario) =>
        locatario.email.toLowerCase() ===
        registerEmailInput.value.trim().toLowerCase()
    );

    const cpfExistente = todosOsLocatarios.some(
      (locatario) =>
        locatario.cpf.toLowerCase() ===
        registerCpfInput.value.trim().toLowerCase()
    );

    if (nomeExistente) {
      registerNameInput.setCustomValidity(
        "Já existe um locatário cadastrado com esse nome."
      );
      registerNameInput.reportValidity();
      return;
    }

    if (emailExistente) {
      registerEmailInput.setCustomValidity(
        "Já existe um locatário cadastrado com esse email."
      );
      registerEmailInput.reportValidity();
      return;
    }

    if (cpfExistente) {
      registerCpfInput.setCustomValidity(
        "Já existe um locatário com esse CPF."
      );
      registerCpfInput.reportValidity();
      return;
    }

    const novoLocatario = {
      name: registerNameInput.value.trim(),
      email: registerEmailInput.value.trim(),
      telephone: registerCelularInput.value.trim(),
      address: registerEnderecoInput.value.trim(),
      cpf: registerCpfInput.value.trim(),
    };

    console.log(novoLocatario);

    try {
      await cadastrarLocatario(novoLocatario);
      closeModal(modalCadastrar);
      openModal(modalCadastrando);
      setTimeout(() => closeModal(modalCadastrando), 1500);
      await carregarLocatarios();
      searchInput.value = "";
      paginaAtual = 1;
    } catch (error) {
      console.error("Erro ao cadastrar locatário:", error.message);
      alert(error.message);
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

  updateCelularInput.addEventListener("input", () => {
    if (
      updateCelularInput.value.trim().length < 11 ||
      updateCelularInput.value.trim().length > 16
    ) {
      updateCelularInput.setCustomValidity(
        "Por favor, insira um celular válido"
      );
    } else {
      updateCelularInput.setCustomValidity("");
    }
  });

  updateEnderecoInput.addEventListener("input", () => {
    if (
      updateEnderecoInput.value.trim().length < 3 ||
      updateEnderecoInput.value.trim().length > 50
    ) {
      updateEnderecoInput.setCustomValidity(
        "Por favor, insira um Endereco válido"
      );
    } else {
      updateEnderecoInput.setCustomValidity("");
    }
  });

  updateCpfInput.addEventListener("input", () => {
    if (
      updateCpfInput.value.trim().length < 11 ||
      updateCpfInput.value.trim().length > 14
    ) {
      updateCpfInput.setCustomValidity("Por favor, insira um CPF válido");
    } else {
      updateCpfInput.setCustomValidity("");
    }
  });

  formAtualizar.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (idLocatarioEditando === null) return;

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
    if (!updateCelularInput.value.trim()) {
      updateCelularInput.setCustomValidity("O celular é obrigatório.");
      updateCelularInput.reportValidity();
      return;
    }
    if (!updateEnderecoInput.value.trim()) {
      updateEnderecoInput.setCustomValidity("O endereço é obrigatório.");
      updateEnderecoInput.reportValidity();
      return;
    }
    if (!updateCpfInput.value.trim()) {
      updateCpfInput.setCustomValidity("O CPF é obrigatório.");
      updateCpfInput.reportValidity();
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

    if (
      updateCelularInput.value.trim().length < 11 ||
      updateCelularInput.value.trim().length > 16
    ) {
      updateCelularInput.setCustomValidity(
        "Por favor, insira um celular válido"
      );
      updateCelularInput.reportValidity();
      return;
    }

    if (
      updateEnderecoInput.value.trim().length < 3 ||
      updateEnderecoInput.value.trim().length > 50
    ) {
      updateEnderecoInput.setCustomValidity(
        "Por favor, insira um Endereco válido"
      );
      updateEnderecoInput.reportValidity();
      return;
    }

    if (
      updateCpfInput.value.trim().length < 11 ||
      updateCpfInput.value.trim().length > 14
    ) {
      updateCpfInput.setCustomValidity("Por favor, insira um CPF válido");
      updateCpfInput.reportValidity();
      return;
    }

    const nomeExistente = todosOsLocatarios.some(
      (locatario) =>
        locatario.id !== idLocatarioEditando &&
        locatario.name.toLowerCase() ===
          updateNameInput.value.trim().toLowerCase()
    );

    const emailExistente = todosOsLocatarios.some(
      (locatario) =>
        locatario.id !== idLocatarioEditando &&
        locatario.email.toLowerCase() ===
          updateEmailInput.value.trim().toLowerCase()
    );

    const cpfExistente = todosOsLocatarios.some(
      (locatario) =>
        locatario.id !== idLocatarioEditando &&
        locatario.cpf.toLowerCase() ===
          updateCpfInput.value.trim().toLowerCase()
    );

    if (nomeExistente) {
      updateNameInput.setCustomValidity(
        "Já existe um locatário cadastrado com esse nome."
      );
      updateNameInput.reportValidity();
      return;
    }

    if (emailExistente) {
      updateEmailInput.setCustomValidity(
        "Já existe um locatário cadastrado com esse email."
      );
      updateEmailInput.reportValidity();
      return;
    }

    if (cpfExistente) {
      updateCpfInput.setCustomValidity("Já existe um locatário com esse CPF.");
      updateCpfInput.reportValidity();
      return;
    }

    const updatedLocatario = {
      name: updateNameInput.value.trim(),
      email: updateEmailInput.value.trim(),
      telephone: updateCelularInput.value.trim(),
      address: updateEnderecoInput.value.trim(),
      cpf: updateCpfInput.value.trim(),
    };

    try {
      await atualizarLocatario(idLocatarioEditando, updatedLocatario);
      closeModal(modalAtualizar);
      openModal(modalAtualizando);
      setTimeout(() => closeModal(modalAtualizando), 1500);
      await carregarLocatarios();
      searchInput.value = "";
    } catch (error) {
      console.error("Erro ao atualizar locatário:", error);
      alert(error.message);
    }
  });

  tableBody.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      if (getRole() !== "ADMIN") return;

      idLocatarioEditando = parseInt(editBtn.dataset.id, 10);
      const locatario = todosOsLocatarios.find(
        (l) => l.id === idLocatarioEditando
      );
      if (locatario) {
        updateNameInput.value = locatario.name;
        updateEmailInput.value = locatario.email;
        updateCelularInput.value = locatario.telephone;
        updateEnderecoInput.value = locatario.address;
        updateCpfInput.value = locatario.cpf;
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
      try {
        await excluirLocatario(idParaExcluir);

        textModal.textContent = "Locatário excluído!";
        iconModal.textContent = "check_circle";
        iconModal.style.color = "rgb(24, 209, 24)";

        closeModal(modalConfirmando);
        openModal(modalDeletando);
        setTimeout(() => closeModal(modalDeletando), 1500);
        await carregarLocatarios();
        searchInput.value = "";
      } catch (error) {
        textModal.textContent = "Locatário vinculado.";
        iconModal.textContent = "cancel";
        iconModal.style.color = "red";

        closeModal(modalConfirmando);
        openModal(modalDeletando);
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
