# Usa una imagen base de Node.js 18
FROM node:18

# Configura el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Instala dependencia de Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libgbm1 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxtst6 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libasound2 \
    libatspi2.0-0 \
    libpango-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libcups2 \
    libxrandr2 \
    libxss1 \
    libxfixes3 \
    libu2f-udev \
    libnss3 \
    libnspr4 \
    libxkbcommon0 \
    libdrm2 \
    libfontconfig1 \
    libgbm-dev


# Copia el resto del código
COPY . .

# Expone el puerto en el que tu aplicación escuchará
EXPOSE 3001

# Define el comando para ejecutar la aplicación
CMD ["node", "server.js"]