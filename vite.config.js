import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        alugueis: resolve(__dirname, "views/alugueis.html"),
        dashboard: resolve(__dirname, "views/dashboard.html"),
        editoras: resolve(__dirname, "views/editoras.html"),
        livros: resolve(__dirname, "views/livros.html"),
        locatarios: resolve(__dirname, "views/locatarios.html"),
        usuarios: resolve(__dirname, "views/usuarios.html"),
      },
    },
  },
});
