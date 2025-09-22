<template>
  <q-page padding>
    <div class="row q-gutter-lg q-pa-md" style="width: 100%; max-width: 1200px">
      <div class="col-12 col-md">
        <q-card class="dashboard-cards border-radius">
          <q-card-section>
            <div class="row items-center justify-center q-gutter-x-lg">
              <q-icon name="emoji_events" class="primeiro-mais-alugado" size="xl"></q-icon>
              <h2 class="text-h5 text-white text-weight-bolder text-with-shadow">
                {{ firstBook?.name || 'Carregando...' }}
              </h2>
              <h2 class="text-h5 text-white text-weight-bolder">
                {{ firstBook?.totalRents }}
              </h2>
            </div>

            <div class="row items-center justify-center q-gutter-x-lg">
              <q-icon name="workspace_premium" class="segundo-mais-alugado" size="lg"></q-icon>
              <h2 class="text-h6 text-white text-weight-bolder text-with-shadow">
                {{ secondBook?.name || 'Carregando...' }}
              </h2>
              <h2 class="text-h6 text-white text-weight-bolder">
                {{ secondBook?.totalRents }}
              </h2>
            </div>

            <div class="row items-center justify-center q-gutter-x-lg">
              <q-icon name="military_tech" class="terceiro-mais-alugado" size="md"></q-icon>
              <h2 class="text-subtitle1 text-white text-weight-bolder text-with-shadow">
                {{ thirdBook?.name || 'Carregando...' }}
              </h2>
              <h2 class="text-subtitle1 text-white text-weight-bolder">
                {{ thirdBook?.totalRents }}
              </h2>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="row col-12 col-md justify-center">
        <q-card class="dashboard-cards border-radius col-grow">
          <q-card-section>
            <p>test</p>
          </q-card-section>
        </q-card>

        <q-card class="dashboard-cards border-radius col-grow">
          <q-card-section>
            <p>test</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md">
        <q-card class="dashboard-cards border-radius">
          <q-card-section style="padding: 8px 16px">
            <div style="height: 400px; position: relative">
              <q-inner-loading :showing="isLoading" label="Calculando dados do gráfico..." />

              <div v-if="error" class="fullscreen text-center flex flex-center">
                <div class="text-negative">
                  <q-icon name="error" size="lg" />
                  <p>{{ error }}</p>
                </div>
              </div>

              <canvas
                v-show="!isLoading && !error"
                ref="chartDoughnutCanvas"
                style="width: 100%; height: 100%; display: block"
              ></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md">
        <q-card class="dashboard-cards border-radius">
          <q-card-section style="padding: 8px 16px">
            <div style="height: 400px; position: relative">
              <q-inner-loading :showing="isLoading" label="Calculando dados do gráfico..." />

              <div v-if="error" class="fullscreen text-center flex flex-center">
                <div class="text-negative">
                  <q-icon name="error" size="lg" />
                  <p>{{ error }}</p>
                </div>
              </div>

              <canvas
                v-show="!isLoading && !error"
                ref="chartBarCanvas"
                style="width: 100%; height: 100%; display: block"
              ></canvas>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useDashboardsStore } from 'src/stores/dashboard-store'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const store = useDashboardsStore()
const { bookMoreRented, deliveredInTimeQuantity, deliveredWithDelayQuantity } = storeToRefs(store)

const firstBook = computed(() => bookMoreRented.value.data?.[0])
const secondBook = computed(() => bookMoreRented.value.data?.[1])
const thirdBook = computed(() => bookMoreRented.value.data?.[2])

const $q = useQuasar()
const chartBarCanvas = ref(null)
const chartDoughnutCanvas = ref(null)

let chartInstance = null

const isLoading = computed(
  () =>
    bookMoreRented.value.loading ||
    deliveredInTimeQuantity.value.loading ||
    deliveredWithDelayQuantity.value.loading,
)

const error = computed(
  () =>
    bookMoreRented.value.error ||
    deliveredInTimeQuantity.value.error ||
    deliveredWithDelayQuantity.value.error,
)

const chartDoughnutData = computed(() => {
  const limeGreen = '#A7ED4A'
  const purple = '#9B59B6'

  return {
    labels: ['Livros alugados no momento', 'Total de aluguéis realizados'],
    datasets: [
      {
        label: 'Status dos Livros',
        data: [1, 1],
        backgroundColor: [limeGreen, purple],
        borderColor: [limeGreen, purple],
        borderWidth: 1,
      },
    ],
  }
})

const chartBarData = computed(() => {
  return {
    labels: ['Maio', 'Junho', 'Julho', 'Agosto', 'Setembro'],
    datasets: [
      {
        label: 'No Prazo',
        data: [10, 15, 25, 35, 50],
        backgroundColor: '#00C9FF',
        borderRadius: 6,
      },
      {
        label: 'Fora do Prazo',
        data: [5, 10, 15, 20, 35],
        backgroundColor: '#FF7F00',
        borderRadius: 6,
      },
    ],
  }
})

const chartDoughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1200,
  },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#fff',
        font: {
          size: 11,
          weight: 700,
        },
        padding: 10,
        boxWidth: 14,
      },
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: function (context) {
          let label = context.label || ''
          if (label) label += ': '
          if (context.parsed !== null) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            label += context.parsed + ' (' + percentage + '%)'
          }
          return label
        },
      },
    },
    title: {
      display: false,
    },
  },
}))

const chartBarOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: $q.dark.isActive ? 'white' : 'black',
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const value =
            context.chart.options.indexAxis === 'y' ? context.parsed.x : context.parsed.y
          return `${context.dataset.label}: ${value}`
        },
      },
    },
    subtitle: {
      display: true,
      text: `Total no prazo (últimos 5 meses): 60 | Total com atraso: 25`,
      color: $q.dark.isActive ? '#ccc' : '#666',
      font: {
        size: 12,
        weight: 'normal',
      },
      padding: {
        bottom: 25,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: $q.dark.isActive ? 'white' : 'black' },
      grid: { color: $q.dark.isActive ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
    },
    x: {
      ticks: { color: $q.dark.isActive ? 'white' : 'black' },
      grid: { color: $q.dark.isActive ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
    },
  },
}))

onMounted(() => {
  store.fetchBookMoreRented(3)
  store.fetchDeliveredInTimeQuantity(5)
  store.fetchDeliveredWithDelayQuantity(5)
})

watchEffect(() => {
  const ctxDoughnut = chartDoughnutCanvas.value?.getContext('2d')
  const ctxBar = chartBarCanvas.value?.getContext('2d')

  if (ctxBar && chartBarData.value) {
    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = new Chart(ctxBar, {
      type: 'bar',
      data: chartBarData.value,
      options: chartBarOptions.value,
    })
  }

  if (ctxDoughnut && chartDoughnutData.value) {
    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: chartDoughnutData.value,
      options: chartDoughnutOptions.value,
    })
  }
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>
