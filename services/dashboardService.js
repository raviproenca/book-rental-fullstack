import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("token");

export const fetchMoreRented = async (dashboardData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/bookMoreRented`,
      {
        params: { numberOfMonths: dashboardData },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchInTime = async (dashboardData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/deliveredInTimeQuantity`,
      {
        params: { numberOfMonths: dashboardData },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchWithDelay = async (dashboardData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/deliveredWithDelayQuantity`,
      {
        params: { numberOfMonths: dashboardData },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchRentsLate = async (dashboardData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/rentsLateQuantity`,
      {
        params: { numberOfMonths: dashboardData },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchPerRenter = async () => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/rentsPerRenter`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log(response.data.content);
    return response.data.content;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const fetchRentsQuantity = async (dashboardData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(
      `${API_BASE_URL}/dashboard/rentsQuantity`,
      {
        params: { numberOfMonths: dashboardData },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const handleAxiosError = (error) => {
  if (error.response) {
    throw new Error(error.response.data?.message || "Erro de resposta da API.");
  } else if (error.request) {
    throw new Error("Sem resposta do servidor. Verifique sua conexão.");
  } else {
    throw new Error("Erro ao realizar requisição: " + error.message);
  }
};
