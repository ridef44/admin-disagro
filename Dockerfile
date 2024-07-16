# Usar la imagen oficial de Node.js
FROM node:21.7.2

# Crear el directorio de la aplicación en el contenedor
WORKDIR /usr/src/app

# Copiar el package.json y package-lock.json (si existe)
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación al contenedor
COPY . .

# Exponer el puerto que usará la aplicación
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
