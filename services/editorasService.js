import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("token");

export const fetchPublishers = async () => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.get(`${API_BASE_URL}/publisher`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const cadastrarEditora = async (editoraData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.post(
      `${API_BASE_URL}/publisher`,
      editoraData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const atualizarEditora = async (editoraId, editoraData) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    const response = await axios.put(
      `${API_BASE_URL}/publisher/${editoraId}`,
      editoraData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const excluirEditora = async (editoraId) => {
  const token = getToken();
  if (!token) throw new Error("Token de autenticação não encontrado.");

  try {
    await axios.delete(`${API_BASE_URL}/publisher/${editoraId}`, {
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
