# --- 1: Build  ---

# Imagem Node.js para compilar a aplicação Quasar.
# 'lts-alpine' é uma versão leve do Node.js baseada em Alpine Linux.
FROM node:lts-alpine AS build-stage

# Define o diretório de trabalho dentro do contêiner.
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
# Otimiza o cache: se as dependências não mudarem ele não precisa rodar 'npm install' novamente.
COPY . .

# Instala as dependências do Node.js.
RUN npm ci

# Copia o restante do código-fonte do projeto.
COPY . .

# Roda o comando de build do Quasar.
RUN npm run build

# --- 2: Nginx ---

# Imagem Nginx leve e otimizada para servir os arquivos estáticos.
FROM nginx:stable-alpine AS production-stage

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o arquivo de configuração customizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos de build gerados no ESTÁGIO 1 
# para o diretório de arquivos estáticos do Nginx.
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

# Expõe a porta 80, padrão do Nginx.
EXPOSE 80

# Comando para iniciar o Nginx e mantê-lo rodando em primeiro plano.
CMD ["nginx", "-g", "daemon off;"]