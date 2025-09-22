import {
  fetchBooks,
  cadastrarLivro,
  atualizarLivro,
  excluirLivro,
} from "/services/livrosService";

import { fetchPublishers } from "/services/editorasService.js";

// --- Variáveis Globais ---
const livrosPorPagina = 6;
let paginaAtual = 1;
let todosOsLivros = [];
let idLivroEditando = null;
let idParaExcluir = null;
let editorasDisponiveis = [];

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
const registerAuthorInput = document.getElementById("register-autor");
const registerLaunchInput = document.getElementById("register-lancamento");
const registerQuantityInput = document.getElementById("register-estoque");
const registerPublisherInput = document.getElementById("register-editora");
const updateNameInput = document.getElementById("update-name");
const updateAuthorInput = document.getElementById("update-autor");
const updateLaunchInput = document.getElementById("update-lancamento");
const updateQuantityInput = document.getElementById("update-estoque");
const updatePublisherInput = document.getElementById("update-editora");
const addLivroBtn = document.getElementById("add-user-btn");
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
  let livrosFiltrados = todosOsLivros;

  // 1. Aplica o filtro de busca
  if (searchTerm) {
    livrosFiltrados = todosOsLivros.filter((book) => {
      const launchDateFormatted = new Date(book.launchDate).toLocaleDateString(
        "pt-BR",
        { timeZone: "UTC" }
      );
      return (
        book.name.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.publisher.name.toLowerCase().includes(searchTerm) ||
        launchDateFormatted.includes(searchTerm) ||
        String(book.totalQuantity).includes(searchTerm) ||
        String(book.totalInUse).includes(searchTerm)
      );
    });
  }

  // 2. Aplica a ordenação
  if (sortState.key) {
    const { key, asc } = sortState;
    livrosFiltrados.sort((a, b) => {
      let valA, valB;

      switch (key) {
        case "publisher":
          valA = a.publisher.name;
          valB = b.publisher.name;
          break;
        case "launchDate":
          valA = new Date(a.launchDate);
          valB = new Date(b.launchDate);
          break;
        default:
          valA = a[key];
          valB = b[key];
          break;
      }

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB; // Comparação numérica direta
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA - valB; // Comparação de datas
      } else {
        comparison = String(valA || "").localeCompare(String(valB || "")); // Comparação de texto
      }

      return asc ? comparison : -comparison;
    });
  }

  // 3. Renderiza a tabela e atualiza as UIs
  paginaAtual = 1;
  renderTable(livrosFiltrados, paginaAtual);
  updateHeaderUI();
  updateMobileSortUI();
};

// --- Funções de Renderização ---
const renderTable = (livrosParaExibir, pagina = 1) => {
  tableBody.innerHTML = "";

  const inicio = (pagina - 1) * livrosPorPagina;
  const fim = inicio + livrosPorPagina;
  const livrosPaginados = livrosParaExibir.slice(inicio, fim);

  if (livrosPaginados.length === 0 && pagina > 1) {
    paginaAtual = Math.max(1, paginaAtual - 1);
    renderTable(livrosParaExibir, paginaAtual);
    return;
  }

  livrosPaginados.forEach((livro) => {
    const editora = editorasDisponiveis.find(
      (e) => e.id === livro.publisher.id
    );

    const tr = tableBody.insertRow();
    tr.innerHTML = `
      <td data-label="Nome">${livro.name}</td>
      <td data-label="Autor">${livro.author}</td>
      <td data-label="Editora">${editora.name}</td>
      <td data-label="Lançamento">${new Date(
        livro.launchDate
      ).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
      <td data-label="Estoque">${livro.totalQuantity}</td>
      <td data-label="Alugados">${livro.totalInUse}</td>
      <td data-label="Ações">
        <button class="action-btn edit-btn" data-id="${livro.id}">
          <span class="material-icons-outlined">edit</span>
        </button>
        <button class="action-btn delete-btn" data-id="${livro.id}">
          <span class="material-icons-outlined">delete</span>
        </button>
      </td>
    `;
  });

  if (livrosParaExibir.length === 0) {
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Nenhum livro encontrado.";
    paginacaoContainer.innerHTML = "";
  } else {
    mensagemErro.style.display = "none";
    renderPaginacao(livrosParaExibir);
  }
};

const renderPaginacao = (livros) => {
  const totalPaginas = Math.ceil(livros.length / livrosPorPagina);
  paginacaoContainer.innerHTML = "";

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "Anterior";
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.classList.add("page-btn");
  btnAnterior.addEventListener("click", () => {
    paginaAtual--;
    renderTable(livros, paginaAtual);
  });
  paginacaoContainer.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === paginaAtual) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaAtual = i;
      renderTable(livros, paginaAtual);
    });
    paginacaoContainer.appendChild(btn);
  }

  const btnProximo = document.createElement("button");
  btnProximo.innerText = "Próximo";
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.classList.add("page-btn");
  btnProximo.addEventListener("click", () => {
    paginaAtual++;
    renderTable(livros, paginaAtual);
  });
  paginacaoContainer.appendChild(btnProximo);
};

const renderEditorasNoSelect = (selectElement) => {
  selectElement.innerHTML = `<option value="">Selecione uma Editora</option>`;
  editorasDisponiveis.forEach((editora) => {
    const option = document.createElement("option");
    option.value = editora.id;
    option.textContent = editora.name;
    selectElement.appendChild(option);
  });
};

// --- Funções de Carregamento ---
const carregarLivros = async () => {
  try {
    todosOsLivros = await fetchBooks();
    aplicarFiltroEOrdenacao();
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Erro ao carregar livros.";
  }
};

const carregarEditoras = async () => {
  try {
    editorasDisponiveis = await fetchPublishers();
    renderEditorasNoSelect(registerPublisherInput);
    renderEditorasNoSelect(updatePublisherInput);
  } catch (error) {
    console.error("Erro ao carregar editoras:", error);
  }
};

// --- Funções de Modal ---
const openModal = (modal) => {
  modalOverlay.classList.add("is-open");
  modal.classList.add("is-open");
};

const closeModal = (modal) => {
  modal.classList.remove("is-open");
  modalOverlay.classList.remove("is-open");
  idLivroEditando = null;
  idParaExcluir = null;
  formCadastrar.reset();
  formAtualizar.reset();
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const allPromises = [fetchPublishers(), fetchBooks()];
    const allResults = await Promise.all(allPromises);

    [editorasDisponiveis, todosOsLivros] = allResults;

    name.textContent = localStorage.getItem("nameUser");
    email.textContent = localStorage.getItem("emailUser");
    getRole() === "ADMIN"
      ? (role.textContent = "Usuário Editor")
      : (role.textContent = "Usuário Leitor");

    renderEditorasNoSelect(registerPublisherInput);
    renderEditorasNoSelect(updatePublisherInput);

    aplicarFiltroEOrdenacao();
  } catch (error) {
    console.error("Erro no carregamento inicial da página:", error);
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Erro ao carregar dados. Tente novamente.";
  }

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

  addLivroBtn.addEventListener("click", () => {
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

  registerAuthorInput.addEventListener("input", () => {
    if (
      registerAuthorInput.validity.typeMismatch ||
      registerAuthorInput.value.trim().length < 3 ||
      registerAuthorInput.value.trim().length > 50
    ) {
      registerAuthorInput.setCustomValidity(
        "Por favor, insira um nome de autor válido."
      );
    } else {
      registerAuthorInput.setCustomValidity("");
    }
  });

  registerQuantityInput.addEventListener("input", () => {
    if (parseInt(registerQuantityInput.value.trim()) < 0) {
      registerQuantityInput.setCustomValidity(
        "O estoque deve ser um número positivo."
      );
    } else {
      registerQuantityInput.setCustomValidity("");
    }
  });

  formCadastrar.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!registerNameInput.value.trim()) {
      registerNameInput.setCustomValidity("O nome é obrigatório.");
      registerNameInput.reportValidity();
      return;
    }

    if (!registerAuthorInput.value.trim()) {
      registerAuthorInput.setCustomValidity("O autor é obrigatório.");
      registerAuthorInput.reportValidity();
      return;
    }

    const selectedPublisherId = parseInt(registerPublisherInput.value, 10);
    if (isNaN(selectedPublisherId)) {
      registerPublisherInput.setCustomValidity("A editora é obrigatória.");
      registerPublisherInput.reportValidity();
      return;
    }

    if (!registerLaunchInput.value.trim()) {
      registerLaunchInput.setCustomValidity(
        "A data de lançamento é obrigatória."
      );
      registerLaunchInput.reportValidity();
      return;
    }

    const selectedDate = new Date(registerLaunchInput.value);
    const today = new Date();
    if (selectedDate > today) {
      registerLaunchInput.setCustomValidity(
        "A data de lançamento não pode ser no futuro."
      );
      registerLaunchInput.reportValidity();
      return;
    }

    if (!registerQuantityInput.value.trim()) {
      registerQuantityInput.setCustomValidity("O estoque é obrigatório");
      registerQuantityInput.reportValidity();
      return;
    }

    if (parseInt(registerQuantityInput.value.trim()) < 0) {
      registerQuantityInput.setCustomValidity(
        "O estoque deve ser um número positivo."
      );
      registerQuantityInput.reportValidity();
      return;
    }

    const newLivro = {
      name: registerNameInput.value.trim(),
      author: registerAuthorInput.value.trim(),
      launchDate: registerLaunchInput.value,
      totalQuantity: parseInt(registerQuantityInput.value, 10),
      publisherId: parseInt(registerPublisherInput.value, 10),
    };

    console.log(newLivro);

    try {
      await cadastrarLivro(newLivro);
      closeModal(modalCadastrar);
      openModal(modalCadastrando);
      setTimeout(() => closeModal(modalCadastrando), 1500);
      await carregarLivros();
      searchInput.value = "";
      paginaAtual = 1;
    } catch (error) {
      console.error("Erro ao cadastrar livro:", error);
      alert(error.message || "Erro ao cadastrar livro.");
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

  updateAuthorInput.addEventListener("input", () => {
    if (
      updateAuthorInput.validity.typeMismatch ||
      updateAuthorInput.value.trim().length < 3 ||
      updateAuthorInput.value.trim().length > 50
    ) {
      updateAuthorInput.setCustomValidity(
        "Por favor, insira um nome de autor válido."
      );
    } else {
      updateAuthorInput.setCustomValidity("");
    }
  });

  updateQuantityInput.addEventListener("input", () => {
    if (parseInt(updateQuantityInput.value.trim()) < 0) {
      updateQuantityInput.setCustomValidity(
        "O estoque deve ser um número positivo."
      );
    } else {
      updateQuantityInput.setCustomValidity("");
    }
  });

  formAtualizar.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (idLivroEditando === null) return;

    if (!updateNameInput.value.trim()) {
      updateNameInput.setCustomValidity("O nome é obrigatório.");
      updateNameInput.reportValidity();
      return;
    }

    if (!updateAuthorInput.value.trim()) {
      updateAuthorInput.setCustomValidity("O autor é obrigatório.");
      updateAuthorInput.reportValidity();
      return;
    }

    const selectedPublisherId = parseInt(updatePublisherInput.value, 10);
    if (isNaN(selectedPublisherId)) {
      updatePublisherInput.setCustomValidity("A editora é obrigatória.");
      updatePublisherInput.reportValidity();
      return;
    }

    if (!updateLaunchInput.value.trim()) {
      updateLaunchInput.setCustomValidity(
        "A data de lançamento é obrigatória."
      );
      updateLaunchInput.reportValidity();
      return;
    }

    const selectedDate = new Date(updateLaunchInput.value);
    const today = new Date();
    if (selectedDate > today) {
      updateLaunchInput.setCustomValidity(
        "A data de lançamento não pode ser no futuro."
      );
      updateLaunchInput.reportValidity();
      return;
    }

    if (!updateQuantityInput.value.trim()) {
      updateQuantityInput.setCustomValidity("O estoque é obrigatório");
      updateQuantityInput.reportValidity();
      return;
    }

    if (parseInt(updateQuantityInput.value.trim()) < 0) {
      updateQuantityInput.setCustomValidity(
        "O estoque deve ser um número positivo."
      );
      updateQuantityInput.reportValidity();
      return;
    }

    const updatedLivro = {
      name: updateNameInput.value.trim(),
      author: updateAuthorInput.value.trim(),
      launchDate: updateLaunchInput.value,
      totalQuantity: parseInt(updateQuantityInput.value, 10),
      publisherId: parseInt(updatePublisherInput.value, 10),
    };

    try {
      await atualizarLivro(idLivroEditando, updatedLivro);
      closeModal(modalAtualizar);
      openModal(modalAtualizando);
      setTimeout(() => closeModal(modalAtualizando), 1500);
      await carregarLivros();
      searchInput.value = "";
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      alert(error.message || "Erro ao atualizar livro.");
    }
  });

  tableBody.addEventListener("click", (event) => {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      if (getRole() !== "ADMIN") return;

      idLivroEditando = parseInt(editBtn.dataset.id, 10);
      const livro = todosOsLivros.find((l) => l.id === idLivroEditando);
      const editora = editorasDisponiveis.find(
        (e) => e.id === livro.publisher.id
      );
      if (livro) {
        updateNameInput.value = livro.name;
        updateAuthorInput.value = livro.author;
        updateLaunchInput.value = livro.launchDate;
        updateQuantityInput.value = livro.totalQuantity;
        updatePublisherInput.value = editora.id;
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
        await excluirLivro(idParaExcluir);

        textModal.textContent = "Livro excluído!";
        iconModal.textContent = "check_circle";
        iconModal.style.color = "rgb(24, 209, 24)";

        closeModal(modalConfirmando);
        openModal(modalDeletando);
        setTimeout(() => closeModal(modalDeletando), 1500);
        await carregarLivros();
        searchInput.value = "";
      } catch (error) {
        textModal.textContent = "Livro vinculado.";
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
