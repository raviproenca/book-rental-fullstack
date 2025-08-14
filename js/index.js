import { login } from "/services/indexService";

const formLogin = document.getElementById("form-login");

const registerEmailInput = document.getElementById("login-email");
const registerPasswordInput = document.getElementById("login-password");

registerEmailInput.addEventListener("input", () => {
  if (
    registerEmailInput.validity.typeMismatch ||
    registerEmailInput.value.trim().length < 7 ||
    registerEmailInput.value.trim().length > 50
  ) {
    registerEmailInput.setCustomValidity("Por favor, insira um email válido.");
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

formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();

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
    registerEmailInput.validity.typeMismatch ||
    registerEmailInput.value.trim().length < 7 ||
    registerEmailInput.value.trim().length > 50
  ) {
    registerEmailInput.setCustomValidity("Por favor, insira um email válido.");
    registerEmailInput.reportValidity();
    return;
  }

  if (registerPasswordInput.value.trim().length < 8) {
    registerPasswordInput.setCustomValidity(
      "A senha deve possui no mínimo 8 dígitos"
    );
  } else if (registerPasswordInput.value.trim().length > 30) {
    registerPasswordInput.setCustomValidity(
      "Por favor, insira uma senha válida."
    );
    registerPasswordInput.reportValidity();
    return;
  }

  const loginData = {
    email: registerEmailInput.value.trim(),
    password: registerPasswordInput.value.trim(),
  };

  try {
    await login(loginData);
    window.location.href = "/views/usuarios.html";
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert(error.message || "Erro ao fazer login.");
  }
});
