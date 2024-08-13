# Usa una imagen base de Node.js 18
FROM node:18

# Configura el directorio de trabajo
WORKDIR /app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto en el que tu aplicación escuchará
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD ["node", "script.js"]