import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("token");

export const fetchBooks = async () => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(`${API_BASE_URL}/book`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const cadastrarLivro = async (livroData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.post(`${API_BASE_URL}/book`, livroData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const atualizarLivro = async (livroId, livroData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.put(
      `${API_BASE_URL}/book/${livroId}`,
      livroData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const excluirLivro = async (livroId) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    await axios.delete(`${API_BASE_URL}/book/${livroId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
