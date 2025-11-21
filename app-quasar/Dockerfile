# --- 1: Build ---
FROM node:lts-alpine AS build-stage
WORKDIR /app

# 1. Copia os arquivos de gerenciamento de pacotes
COPY package.json package-lock.json ./

# 2. Instala as dependências 
RUN npm ci --ignore-scripts

# 3. Copia o resto do código-fonte
COPY . .

# 4. Roda o build.
RUN npm run build

# --- 2: Nginx ---
FROM nginx:stable-alpine AS production-stage
RUN rm /etc/nginx/conf.d/default.conf

# Copia o nginx.conf (que foi copiado no passo 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos da pasta dist/spa (criada no Passo 4)
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]