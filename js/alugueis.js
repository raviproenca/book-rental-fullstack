import {
  fetchRents,
  cadastrarAluguel,
  atualizarAluguel,
  finalizarAluguel,
} from "/services/alugueisService.js";

import { fetchBooks } from "/services/livrosService.js";
import { fetchRenters } from "/services/locatariosService.js";

// --- Variáveis Globais ---
const alugueisPorPagina = 6;
let paginaAtual = 1;
let todosOsAlugueis = [];
let idAluguelEditando = null;
let idParaExcluir = null;
let livrosDisponiveis = [];
let locatariosDisponiveis = [];

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
const registerLivroInput = document.getElementById("register-livro");
const registerLocatarioInput = document.getElementById("register-locatario");
const registerDataEntregaInput = document.getElementById(
  "register-data-entrega"
);
const updateLivroInput = document.getElementById("update-livro");
const updateLocatarioInput = document.getElementById("update-locatario");
const updateDataEntregaInput = document.getElementById("update-data-entrega");
const addAluguelBtn = document.getElementById("add-user-btn");
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

// --- Funções de Renderização ---
const renderTable = (alugueis, pagina = 1) => {
  tableBody.innerHTML = "";

  const inicio = (pagina - 1) * alugueisPorPagina;
  const fim = inicio + alugueisPorPagina;
  const alugueisPaginados = alugueis.slice(inicio, fim);

  alugueisPaginados.forEach((aluguel) => {
    const livro = livrosDisponiveis.find((e) => e.id === aluguel.book.id);
    const locatario = locatariosDisponiveis.find(
      (e) => e.id === aluguel.renter.id
    );

    const tr = tableBody.insertRow();

    const isReturned =
      aluguel.status === "DELIVERED_WITH_DELAY" || aluguel.status === "IN_TIME";

    const returnedBtnClass = isReturned
      ? "action-btn returned-btn active"
      : "action-btn returned-btn";

    tr.innerHTML = `
      <td data-label="Livro">${livro.name}</td>
      <td data-label="Locatário">${locatario.name}</td>
      <td data-label="Data de Locação">${new Date(
        aluguel.rentDate
      ).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</td>
      <td data-label="Data de Devolução">${
        aluguel.devolutionDate
          ? new Date(aluguel.devolutionDate).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
            })
          : "Aluguel em andamento"
      }</td>
      <td data-label="Status">${
        aluguel.status === "LATE"
          ? "Atrasado"
          : aluguel.status === "DELIVERED_WITH_DELAY"
          ? "Devolvido com atraso"
          : aluguel.status === "IN_TIME"
          ? "Devolvido no prazo"
          : "Em dia"
      }</td>
      <td data-label="Ações">
        <button class="action-btn edit-btn" data-id="${aluguel.id}">
          <span class="material-icons-outlined">edit</span>
        </button>
        <button class="action-btn ${returnedBtnClass}" data-id="${aluguel.id}">
          <span class="material-icons-outlined">check_box</span>
        </button>
      </td>
    `;
  });

  if (alugueis.length === 0) {
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Nenhum aluguel encontrado.";
    paginacaoContainer.innerHTML = "";
  } else {
    mensagemErro.style.display = "none";
    renderPaginacao(alugueis);
  }
};

const renderPaginacao = (alugueis) => {
  const totalPaginas = Math.ceil(alugueis.length / alugueisPorPagina);
  paginacaoContainer.innerHTML = "";

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "Anterior";
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.classList.add("page-btn");
  btnAnterior.addEventListener("click", () => {
    paginaAtual--;
    renderTable(alugueis, paginaAtual);
  });
  paginacaoContainer.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("page-btn");
    if (i === paginaAtual) btn.classList.add("active");
    btn.addEventListener("click", () => {
      paginaAtual = i;
      renderTable(alugueis, paginaAtual);
    });
    paginacaoContainer.appendChild(btn);
  }

  const btnProximo = document.createElement("button");
  btnProximo.innerText = "Próximo";
  btnProximo.disabled = paginaAtual === totalPaginas;
  btnProximo.classList.add("page-btn");
  btnProximo.addEventListener("click", () => {
    paginaAtual++;
    renderTable(alugueis, paginaAtual);
  });
  paginacaoContainer.appendChild(btnProximo);
};

const renderLivrosNoSelect = (selectElement) => {
  selectElement.innerHTML = `<option value="">Selecione um Livro</option>`;
  livrosDisponiveis.forEach((livro) => {
    const option = document.createElement("option");
    option.value = livro.id;
    option.textContent = livro.name;
    selectElement.appendChild(option);
  });
};

const renderLocatariosNoSelect = (selectElement) => {
  selectElement.innerHTML = `<option value="">Selecione um Locatário</option>`;
  locatariosDisponiveis.forEach((locatario) => {
    const option = document.createElement("option");
    option.value = locatario.id;
    option.textContent = locatario.name;
    selectElement.appendChild(option);
  });
};

// --- Funções de Carregamento ---
const carregarAlugueis = async () => {
  try {
    todosOsAlugueis = await fetchRents();
    renderTable(todosOsAlugueis, paginaAtual);
  } catch (error) {
    console.error("Erro ao carregar aluguéis:", error);
    mensagemErro.style.display = "block";
    mensagemErro.textContent = "Erro ao carregar aluguéis.";
  }
};

const carregarLivros = async () => {
  try {
    livrosDisponiveis = await fetchBooks();
    renderLivrosNoSelect(registerLivroInput);
    renderLivrosNoSelect(updateLivroInput);
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
};

const carregarLocatarios = async () => {
  try {
    locatariosDisponiveis = await fetchRenters();
    renderLocatariosNoSelect(registerLocatarioInput);
    renderLocatariosNoSelect(updateLocatarioInput);
  } catch (error) {
    console.error("Erro ao carregar locatários:", error);
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
  idAluguelEditando = null;
  idParaExcluir = null;
  formCadastrar.reset();
  formAtualizar.reset();
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", async () => {
  await carregarLivros();
  await carregarLocatarios();
  await carregarAlugueis();

  name.textContent = localStorage.getItem("nameUser");
  email.textContent = localStorage.getItem("emailUser");
  getRole() === "ADMIN"
    ? (role.textContent = "Usuário Editor")
    : (role.textContent = "Usuário Leitor");

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredAlugueis = todosOsAlugueis.filter((aluguel) => {
      const rentDateFormatted = new Date(aluguel.rentDate).toLocaleDateString(
        "pt-BR",
        { timeZone: "UTC" }
      );
      const devolutionDateFormatted = aluguel.devolutionDate
        ? new Date(aluguel.devolutionDate).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })
        : "";
      return (
        aluguel.book.name.toLowerCase().includes(searchTerm) ||
        aluguel.renter.name.toLowerCase().includes(searchTerm) ||
        rentDateFormatted.includes(searchTerm) ||
        devolutionDateFormatted.includes(searchTerm)
      );
    });
    paginaAtual = 1;
    renderTable(filteredAlugueis, paginaAtual);
  });

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("nameUser");
    localStorage.removeItem("emailUser");
    localStorage.removeItem("roleUser");
    window.location.href = "/index.html";
  });

  addAluguelBtn.addEventListener("click", () => {
    if (getRole() !== "ADMIN") return;

    openModal(modalCadastrar);
  });

  cancelarBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
  );

  fecharBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal")))
  );

  formCadastrar.addEventListener("submit", async (event) => {
    event.preventDefault();

    const selectedBookId = parseInt(registerLivroInput.value, 10);
    if (isNaN(selectedBookId)) {
      registerLivroInput.setCustomValidity("O livro é obrigatório.");
      registerLivroInput.reportValidity();
      return;
    }

    const selectedRenterId = parseInt(registerLocatarioInput.value, 10);
    if (isNaN(selectedRenterId)) {
      registerLocatarioInput.setCustomValidity("O locatário é obrigatório.");
      registerLocatarioInput.reportValidity();
      return;
    }

    if (!registerDataEntregaInput.value.trim()) {
      registerDataEntregaInput.setCustomValidity(
        "A data de entrega é obrigatória."
      );
      registerDataEntregaInput.reportValidity();
      return;
    }

    const selectedDate = new Date(registerDataEntregaInput.value);
    const today = new Date();
    if (selectedDate < today) {
      registerDataEntregaInput.setCustomValidity(
        "A data de entrega não pode ser no passado."
      );
      registerDataEntregaInput.reportValidity();
      return;
    }

    const novoAluguel = {
      renterId: parseInt(registerLocatarioInput.value, 10),
      bookId: parseInt(registerLivroInput.value, 10),
      deadLine: registerDataEntregaInput.value,
    };

    try {
      await cadastrarAluguel(novoAluguel);
      closeModal(modalCadastrar);
      openModal(modalCadastrando);
      setTimeout(() => closeModal(modalCadastrando), 1500);
      await carregarAlugueis();
      searchInput.value = "";
      paginaAtual = Math.ceil(todosOsAlugueis.length / alugueisPorPagina);
    } catch (error) {
      console.error("Erro ao cadastrar aluguel:", error);
      alert(error.message);
    }
  });

  formAtualizar.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (idAluguelEditando === null) return;

    const selectedBookId = parseInt(updateLivroInput.value, 10);
    if (isNaN(selectedBookId)) {
      updateLivroInput.setCustomValidity("O livro é obrigatório.");
      updateLivroInput.reportValidity();
      return;
    }

    const selectedRenterId = parseInt(updateLocatarioInput.value, 10);
    if (isNaN(selectedRenterId)) {
      updateLocatarioInput.setCustomValidity("O locatário é obrigatório.");
      updateLocatarioInput.reportValidity();
      return;
    }

    if (!updateDataEntregaInput.value.trim()) {
      updateDataEntregaInput.setCustomValidity(
        "A data de entrega é obrigatória."
      );
      updateDataEntregaInput.reportValidity();
      return;
    }

    const selectedDate = new Date(updateDataEntregaInput.value);
    const today = new Date();
    if (selectedDate < today) {
      updateDataEntregaInput.setCustomValidity(
        "A data de entrega não pode ser no passado."
      );
      updateDataEntregaInput.reportValidity();
      return;
    }

    const aluguelAtualizado = {
      renterId: parseInt(updateLocatarioInput.value, 10),
      bookId: parseInt(updateLivroInput.value, 10),
      deadLine: updateDataEntregaInput.value,
    };

    try {
      await atualizarAluguel(idAluguelEditando, aluguelAtualizado);
      closeModal(modalAtualizar);
      openModal(modalAtualizando);
      setTimeout(() => closeModal(modalAtualizando), 1500);
      await carregarAlugueis();
      searchInput.value = "";
    } catch (error) {
      console.error("Erro ao atualizar aluguel:", error);
      alert(error.message);
    }
  });

  tableBody.addEventListener("click", (event) => {
    const returnedBtn = event.target.closest(".returned-btn");
    const editBtn = event.target.closest(".edit-btn");

    if (editBtn) {
      if (getRole() !== "ADMIN") return;

      idAluguelEditando = parseInt(editBtn.dataset.id, 10);
      const aluguel = todosOsAlugueis.find((l) => l.id === idAluguelEditando);
      const livro = livrosDisponiveis.find((e) => e.id === aluguel.book.id);
      const locatario = locatariosDisponiveis.find(
        (e) => e.id === aluguel.renter.id
      );
      if (aluguel) {
        updateLivroInput.value = livro.id;
        updateLocatarioInput.value = locatario.id;
        updateDataEntregaInput.value = aluguel.deadLine;
        openModal(modalAtualizar);
      }
    }

    if (!returnedBtn.classList.contains("active")) {
      if (getRole() !== "ADMIN") return;

      idParaExcluir = parseInt(returnedBtn.dataset.id, 10);
      openModal(modalConfirmando);
    }
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    if (idParaExcluir !== null) {
      try {
        await finalizarAluguel(idParaExcluir);
        closeModal(modalConfirmando);
        openModal(modalDeletando);
        setTimeout(() => closeModal(modalDeletando), 1500);
        await carregarAlugueis();
        searchInput.value = "";
      } catch (error) {
        console.error("Erro ao finalizar aluguel:", error);
        alert(error.message);
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
