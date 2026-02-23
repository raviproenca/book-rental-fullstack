# --- Estágio 1: Build ---
FROM node:lts-alpine AS build-stage
WORKDIR /app

# Instala o Quasar CLI globalmente para garantir que o comando 'build' funcione
RUN npm install -g @quasar/cli

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
# Executa o build (ajuste se seu comando for diferente, ex: 'quasar build')
RUN npm run build

# --- Estágio 2: Produção com Nginx ---
FROM nginx:stable-alpine AS production-stage

# Remove a config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração específica que criamos no Passo 1
# Certifique-se de que o nome do arquivo aqui seja o mesmo que você criou
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados no build
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

EXPOSE 80

# Inicia o Nginx (daemon off é necessário para o container não fechar)
CMD ["nginx", "-g", "daemon off;"]