import {
  fetchMoreRented,
  fetchInTime,
  fetchWithDelay,
  fetchRentsLate,
  fetchPerRenter,
  fetchRentsQuantity,
} from "/services/dashboardService.js";

const selectLocatario = document.getElementById("register-locatario");
const toggleNav = document.getElementById("toggle-nav");
const nav = document.getElementById("navbar");
const profileButton = document.getElementById("profile-button");
const profileModal = document.getElementById("profile-modal");
const name = document.querySelector(".name");
const email = document.querySelector(".email");
const role = document.querySelector(".role");
const logoutButton = document.getElementById("logout-button");

let locatariosDisponiveis = [];
let livrosMaisAlugados = [];

const getRole = () => localStorage.getItem("roleUser");

const renderLocatariosNoSelect = (selectElement) => {
  selectElement.innerHTML = `<option>selecione</option>`;
  locatariosDisponiveis.forEach((locatario) => {
    const option = document.createElement("option");
    option.value = locatario.name;
    option.textContent = locatario.name;
    selectElement.appendChild(option);
  });
};

const carregarLocatarios = async () => {
  try {
    locatariosDisponiveis = await fetchPerRenter();
    renderLocatariosNoSelect(selectLocatario);
  } catch (error) {
    console.error("Erro ao carregar locatários:", error);
  }
};

const carregarLivros = async () => {
  try {
    livrosMaisAlugados = await fetchMoreRented(12);
  } catch (error) {
    console.error("Erro ao carregar livros:", error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  await carregarLivros();
  await carregarLocatarios();

  name.textContent = localStorage.getItem("nameUser");
  email.textContent = localStorage.getItem("emailUser");
  getRole() === "ADMIN"
    ? (role.textContent = "Usuário Editor")
    : (role.textContent = "Usuário Leitor");

  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("nameUser");
    localStorage.removeItem("emailUser");
    localStorage.removeItem("roleUser");
    window.location.href = "/index.html";
  });

  document.getElementById("mais-alugado").textContent =
    livrosMaisAlugados[0].name;
  document.getElementById("segundo-mais-alugado").textContent =
    livrosMaisAlugados[1].name;
  document.getElementById("terceiro-mais-alugado").textContent =
    livrosMaisAlugados[2].name;

  document.getElementById(
    "mais-alugado-number"
  ).textContent = `${livrosMaisAlugados[0].totalRents}x`;
  document.getElementById(
    "segundo-mais-alugado-number"
  ).textContent = `${livrosMaisAlugados[1].totalRents}x`;
  document.getElementById(
    "terceiro-mais-alugado-number"
  ).textContent = `${livrosMaisAlugados[2].totalRents}x`;

  document.getElementById("emprestado-number").textContent =
    await fetchRentsQuantity(1);
  document.getElementById("atrasado-number").textContent = await fetchRentsLate(
    1
  );

  const UmAnoNoPrazo = await fetchInTime(2);
  const DoisAnosNoPrazo = await fetchInTime(4);
  const TresAnosNoPrazo = await fetchInTime(7);
  const QuatroAnosNoPrazo = await fetchInTime(10);
  const CincoAnosNoPrazo = await fetchInTime(12);

  const UmAnoForaPrazo = await fetchWithDelay(2);
  const DoisAnosForaPrazo = await fetchWithDelay(4);
  const TresAnosForaPrazo = await fetchWithDelay(7);
  const QuatroAnosForaPrazo = await fetchWithDelay(10);
  const CincoAnosForaPrazo = await fetchWithDelay(12);

  const totalDentroPrazo = await fetchInTime(99);
  const totalForaPrazo = await fetchWithDelay(99);

  const ctxLocatariosPie = document
    .getElementById("locatarios-chart-pie")
    .getContext("2d");

  const ctxLivrosBar = document
    .getElementById("livros-chart-bar")
    .getContext("2d");

  const orange = "#FF7F00";
  const limeGreen = "#A7ED4A";
  const purple = "#9B59B6";
  const cyan = "#4ECDC4";

  const dentroPrazo = [
    UmAnoNoPrazo,
    DoisAnosNoPrazo - UmAnoNoPrazo,
    TresAnosNoPrazo - DoisAnosNoPrazo,
    QuatroAnosNoPrazo - TresAnosNoPrazo,
    CincoAnosNoPrazo - QuatroAnosNoPrazo,
  ];

  const foraPrazo = [
    UmAnoForaPrazo,
    DoisAnosForaPrazo - UmAnoForaPrazo,
    TresAnosForaPrazo - DoisAnosForaPrazo,
    QuatroAnosForaPrazo - TresAnosForaPrazo,
    CincoAnosForaPrazo - QuatroAnosForaPrazo,
  ];

  const mediaQuery = window.matchMedia("(max-width: 480px)");
  const isMobile = mediaQuery.matches;
  const dynamicFontSize = isMobile ? 11 : 14;
  const dynamicPadding = isMobile ? 10 : 20;

  let locatarioChart = null;

  selectLocatario.addEventListener("change", (event) => {
    const nomeSelecionado = event.target.value;
    const locatario = locatariosDisponiveis.find(
      (l) => l.name === nomeSelecionado
    );

    if (locatarioChart) {
      locatarioChart.data.datasets[0].data = [
        locatario.rentsActive,
        locatario.rentsQuantity,
      ];
      locatarioChart.update();
    }
  });

  // === DOUGHNUT CHART ===
  locatarioChart = new Chart(ctxLocatariosPie, {
    type: "doughnut",
    data: {
      labels: ["Livros alugados no momento", "Total de aluguéis realizados"],
      datasets: [
        {
          label: "Status dos Livros",
          data: [1, 1],
          backgroundColor: [limeGreen, purple],
          borderColor: [limeGreen, purple],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1200,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#fff",
            font: {
              size: dynamicFontSize,
              weight: 700,
            },
            padding: dynamicPadding,
            boxWidth: 14,
          },
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) label += ": ";
              if (context.parsed !== null) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                label += context.parsed + " (" + percentage + "%)";
              }
              return label;
            },
          },
        },
        title: {
          display: false,
        },
      },
    },
  });

  // === BAR CHART COMPARATIVO ===
  let chartInstance;

  const createChart = async (isMobile) => {
    if (chartInstance) chartInstance.destroy();

    const fontSize = isMobile ? 10 : 14;
    const titleFontSize = isMobile ? 12 : 16;
    const paddingMobile = isMobile ? 25 : 15;

    chartInstance = new Chart(ctxLivrosBar, {
      type: "bar",
      data: {
        labels: ["2025", "2024", "2023", "2022", "2021"],
        datasets: [
          {
            label: "No Prazo",
            data: dentroPrazo,
            backgroundColor: "#00C9FF",
            borderRadius: 6,
          },
          {
            label: "Fora do Prazo",
            data: foraPrazo,
            backgroundColor: "#FF7F00",
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: isMobile ? "x" : "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#fff",
              boxWidth: 12,
              padding: 15,
              font: {
                size: fontSize,
                weight: 700,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value =
                  context.chart.options.indexAxis === "y"
                    ? context.parsed.x
                    : context.parsed.y;
                return `${context.dataset.label}: ${value}`;
              },
            },
          },
          subtitle: {
            display: true,
            text: `Total devolvidos no prazo: ${totalDentroPrazo}    |    Devolvidos com atraso: ${totalForaPrazo}`,
            color: "#fff",
            font: {
              size: titleFontSize,
              weight: 700,
            },
            padding: {
              bottom: paddingMobile,
            },
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#fff",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: "#fff",
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  };

  await createChart(isMobile);
  mediaQuery.addEventListener("change", async (e) => {
    await createChart(e.matches);
  });

  toggleNav.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("active") && !nav.contains(e.target)) {
      nav.classList.remove("active");
    }
  });

  profileButton.addEventListener("click", () => {
    profileModal.classList.toggle("visible");
  });

  document.addEventListener("click", (e) => {
    if (!profileButton.contains(e.target) && !profileModal.contains(e.target)) {
      profileModal.classList.remove("visible");
    }
  });
});
