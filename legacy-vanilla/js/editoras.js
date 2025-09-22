// --- views/editoras.js ---
import {
  fetchPublishers,
  cadastrarEditora,
  atualizarEditora,
  excluirEditora,
} from "/services/editorasService";

const editorasPorPagina = 6;
let paginaAtual = 1;
let todasAsEditoras = [];
let idEditoraEditando = null;
let idParaExcluir = null;

let sortState = { key: null, asc: true };

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
const registerTelefoneInput = document.getElementById("register-telefone");
const registerSiteInput = document.getElementById("register-site");
const updateNameInput = document.getElementById("update-name");
const updateEmailInput = document.getElementById("update-email");
const updateTelefoneInput = document.getElementById("update-telefone");
const updateSiteInput = document.getElementById("update-site");
const addEditoraBtn = document.getElementById("add-user-btn");
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
const sortableHeaders = document.querySelectorAll(
  "#users-table thead th[data-key]"
);
const sortSelect = document.getElementById("sort-select");
const sortDirectionToggle = document.getElementById("sort-direction-toggle");

// --- Funções de Ordenação e UI ---
const updateHeaderUI = () => {
  sortableHeaders.forEach((header) => {
    header.classList.remove("sort-asc", "sort-desc");
    if (header.dataset.key === sortState.key) {
      header.classList.add(sortState.asc ? "sort-asc" : "sort-desc");
    }
  });
};

const updateMobileSortUI = () => {
  sortSelect.value = sortState.key;

  const icon = sortDirectionToggle.querySelector("span");
  icon.textContent = sortState.asc ? "arrow_upward" : "arrow_downward";
};

const aplicarFiltroEOrdenacao = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  let editorasFiltradas = todasAsEditoras;

  // 1. Aplica o filtro de busca
  if (searchTerm) {
    editorasFiltradas = todasAsEditoras.filter((editora) => {
      const hasSite =
        editora.site && editora.site.toLowerCase().includes(searchTerm);
      return (
        editora.name.toLowerCase().includes(searchTerm) ||
        editora.email.toLowerCase().includes(searchTerm) ||
        editora.telephone.toLowerCase().includes(searchTerm) ||
        hasSite
      );
    });
  }

  // 2. Aplica a ordenação
  if (sortState.key) {
    const { key, asc } = sortState;
    editorasFiltradas.sort((a, b) => {
      const valA = a[key] || "";
      const valB = b[key] || "";
      const comparison = String(valA).localeCompare(String(valB), undefined, {
        numeric: true,
      });
      return asc ? comparison : -comparison;
    });
  }

  // 3. Renderiza a tabela e atualiza as UIs
  paginaAtual = 1;
  renderTable(editorasFiltradas, paginaAtual);
  updateHeaderUI();
  updateMobileSortUI();
};

// --- Funções de Renderização ---

const renderTable = (editorasParaExibir, pagina = 1) => {
  tableBody.innerHTML = "";

  const inicio = (pagina - 1) * editorasPorPagina;
  const fim = inicio + editorasPorPagina;
  const editorasPaginadas = editorasParaExibir.slice(inicio, fim);

  if (editorasPaginadas.length === 0 && pagina > 1) {
    paginaAtual = Math.max(1, paginaAtual - 1);
    renderTable(editorasParaExibir, paginaAtual);
    return;
  }

  editorasPaginadas.forEach((editora) => {
    const tr = tableBody.insertRow();
    tr.innerHTML = `
        <td data-label="Nome">${editora.name}</td>
        <td data-label="Email"><div class="editable-cell" contenteditable="false">${
          editora.email
        }</div></td>
        <td data-label="Telefone">${editora.telephone}</td>
        <td data-label="Site"><div class="editable-cell" contenteditable="false">${
          editora.site || "-"
        }</div></td>
        <td data-label="Ações">
          <button class="action-btn edit-btn" data-id="${editora.id}">
            <span class="material-icons-outlined">edit</span>
          </button>
          <button class="action-btn delete-btn" data-id="${editora.id}">
            <span class="material-icons-outlined">delete</span>
          </button>
        </td>
      `;
  });

  if (editorasParaExibir.length === 0) {
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Nenhuma editora encontrada.";
    paginacaoContainer.innerHTML = "";
  } else {
    mensagemErro.style.display = "none";
    renderPaginacao(editorasParaExibir);
  }
};

const renderPaginacao = (editoras) => {
  const totalPaginas = Math.ceil(editoras.length / editorasPorPagina);
  paginacaoContainer.innerHTML = "";

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "Anterior";
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.classList.add("page-btn");
  btnAnterior.addEventListener("click", () => {
    paginaAtual--;
    renderTable(editoras, paginaAtual);
  });

  paginacaoContainer.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === paginaAtual) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaAtual = i;
      renderTable(editoras, paginaAtual);
    });
    paginacaoContainer.appendChild(btn);
  }

  const btnProximo = document.createElement("button");
  btnProximo.innerText = "Próximo";
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.classList.add("page-btn");
  btnProximo.addEventListener("click", () => {
    paginaAtual++;
    renderTable(editoras, paginaAtual);
  });
  paginacaoContainer.appendChild(btnProximo);
};

const openModal = (modalElement) => {
  modalOverlay.classList.add("is-open");
  modalElement.classList.add("is-open");
};

const closeModal = (modalElement) => {
  modalElement.classList.remove("is-open");
  modalOverlay.classList.remove("is-open");
  idEditoraEditando = null;
  idParaExcluir = null;
  formCadastrar.reset();
  formAtualizar.reset();
};

const carregarEditoras = async () => {
  try {
    todasAsEditoras = await fetchPublishers();
    aplicarFiltroEOrdenacao();
  } catch (error) {
    console.error("Erro ao buscar editoras:", error);
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Erro ao carregar editoras.";
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await carregarEditoras();

  name.textContent = localStorage.getItem("nameUser");
  email.textContent = localStorage.getItem("emailUser");
  getRole() === "ADMIN"
    ? (role.textContent = "Usuário Editor")
    : (role.textContent = "Usuário Leitor");

  searchInput.addEventListener("input", aplicarFiltroEOrdenacao);

  sortableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.dataset.key;
      if (sortState.key === key) {
        sortState.asc = !sortState.asc;
      } else {
        sortState.key = key;
        sortState.asc = true;
      }
      aplicarFiltroEOrdenacao();
    });
  });

  sortSelect.addEventListener("change", (event) => {
    sortState.key = event.target.value;
    sortState.asc = true;
    aplicarFiltroEOrdenacao();
  });

  sortDirectionToggle.addEventListener("click", () => {
    sortState.asc = !sortState.asc;
    aplicarFiltroEOrdenacao();
  });

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("nameUser");
    localStorage.removeItem("emailUser");
    localStorage.removeItem("roleUser");
    window.location.href = "/index.html";
  });

  addEditoraBtn.addEventListener("click", () => {
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

  registerTelefoneInput.addEventListener("input", () => {
    if (
      registerTelefoneInput.value.trim().length < 11 ||
      registerTelefoneInput.value.trim().length > 16
    ) {
      registerTelefoneInput.setCustomValidity(
        "Por favor, insira um telefone válido"
      );
    } else {
      registerTelefoneInput.setCustomValidity("");
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

    if (!registerTelefoneInput.value.trim()) {
      registerTelefoneInput.setCustomValidity("O telefone é obrigatório.");
      registerTelefoneInput.reportValidity();
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
      registerTelefoneInput.value.trim().length < 11 ||
      registerTelefoneInput.value.trim().length > 16
    ) {
      registerTelefoneInput.setCustomValidity(
        "Por favor, insira um telefone válido"
      );
      registerTelefoneInput.reportValidity();
      return;
    }

    if (registerSiteInput.value.trim() != "") {
      if (
        registerSiteInput.validity.typeMismatch ||
        registerSiteInput.value.trim().length < 16
      ) {
        registerSiteInput.setCustomValidity("Por favor, insira um site válido");
        registerSiteInput.reportValidity();
        return;
      }
    }

    const nomeExistente = todasAsEditoras.some(
      (editora) =>
        editora.name.toLowerCase() ===
        registerNameInput.value.trim().toLowerCase()
    );

    const emailExistente = todasAsEditoras.some(
      (editora) =>
        editora.email.toLowerCase() ===
        registerEmailInput.value.trim().toLowerCase()
    );

    if (nomeExistente) {
      registerNameInput.setCustomValidity(
        "Já existe uma editora cadastrada com esse nome."
      );
      registerNameInput.reportValidity();
      return;
    }

    if (emailExistente) {
      registerEmailInput.setCustomValidity(
        "Já existe uma editora cadastrada com esse email."
      );
      registerEmailInput.reportValidity();
      return;
    }

    const newEditora = {
      name: registerNameInput.value.trim(),
      email: registerEmailInput.value.trim(),
      telephone: registerTelefoneInput.value.trim(),
      site: registerSiteInput.value.trim() || "",
    };
    try {
      await cadastrarEditora(newEditora);
      closeModal(modalCadastrar);
      openModal(modalCadastrando);
      setTimeout(() => closeModal(modalCadastrando), 1500);
      await carregarEditoras();
      searchInput.value = "";
      paginaAtual = 1;
    } catch (error) {
      console.error("Erro ao cadastrar editora:", error);
      alert("Erro ao cadastrar editora.");
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

  updateTelefoneInput.addEventListener("input", () => {
    if (
      updateTelefoneInput.value.trim().length < 11 ||
      updateTelefoneInput.value.trim().length > 16
    ) {
      updateTelefoneInput.setCustomValidity(
        "Por favor, insira um telefone válido"
      );
    } else {
      updateTelefoneInput.setCustomValidity("");
    }
  });

  formAtualizar.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (idEditoraEditando === null) return;

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

    if (!updateTelefoneInput.value.trim()) {
      updateTelefoneInput.setCustomValidity("O telefone é obrigatório.");
      updateTelefoneInput.reportValidity();
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
      updateTelefoneInput.value.trim().length < 11 ||
      updateTelefoneInput.value.trim().length > 16
    ) {
      updateTelefoneInput.setCustomValidity(
        "Por favor, insira um telefone válido"
      );
      updateTelefoneInput.reportValidity();
      return;
    }

    if (updateSiteInput.value.trim() != "") {
      if (
        updateSiteInput.validity.typeMismatch ||
        updateSiteInput.value.trim().length < 16
      ) {
        updateSiteInput.setCustomValidity("Por favor, insira um site válido");
        updateSiteInput.reportValidity();
        return;
      }
    }

    const nomeExistente = todasAsEditoras.some(
      (editora) =>
        editora.id !== idEditoraEditando &&
        editora.name.toLowerCase() ===
          updateNameInput.value.trim().toLowerCase()
    );

    const emailExistente = todasAsEditoras.some(
      (editora) =>
        editora.id !== idEditoraEditando &&
        editora.email.toLowerCase() ===
          updateEmailInput.value.trim().toLowerCase()
    );

    if (nomeExistente) {
      updateNameInput.setCustomValidity(
        "Já existe uma editora cadastrada com esse nome."
      );
      updateNameInput.reportValidity();
      return;
    }

    if (emailExistente) {
      updateEmailInput.setCustomValidity(
        "Já existe uma editora cadastrada com esse email."
      );
      updateEmailInput.reportValidity();
      return;
    }

    const updatedEditora = {
      name: updateNameInput.value.trim(),
      email: updateEmailInput.value.trim(),
      telephone: updateTelefoneInput.value.trim(),
      site: updateSiteInput.value.trim() || "",
    };

    try {
      await atualizarEditora(idEditoraEditando, updatedEditora);
      closeModal(modalAtualizar);
      openModal(modalAtualizando);
      setTimeout(() => closeModal(modalAtualizando), 1500);
      await carregarEditoras();
      searchInput.value = "";
    } catch (error) {
      console.error("Erro ao atualizar editora:", error);
      alert("Erro ao atualizar editora.");
    }
  });

  tableBody.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      if (getRole() !== "ADMIN") return;

      const editoraId = parseInt(editBtn.dataset.id, 10);
      idEditoraEditando = editoraId;
      const editoraToEdit = todasAsEditoras.find((u) => u.id === editoraId);
      if (editoraToEdit) {
        updateNameInput.value = editoraToEdit.name;
        updateEmailInput.value = editoraToEdit.email;
        updateTelefoneInput.value = editoraToEdit.telephone;
        updateSiteInput.value = editoraToEdit.site || "";
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
        await excluirEditora(idParaExcluir);

        textModal.textContent = "Editora excluída!";
        iconModal.textContent = "check_circle";
        iconModal.style.color = "rgb(24, 209, 24)";

        closeModal(modalConfirmando);
        openModal(modalDeletando);
        setTimeout(() => closeModal(modalDeletando), 1500);
        await carregarEditoras();
        searchInput.value = "";
      } catch (error) {
        textModal.textContent = "Editora vinculada.";
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
