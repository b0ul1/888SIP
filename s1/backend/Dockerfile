FROM node:20

WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances Node
RUN npm install

# ✅ Installation de SoX pour la conversion audio
RUN apt update && apt install -y sox libsox-fmt-all && rm -rf /var/lib/apt/lists/*

# Copie du code source
COPY . .

EXPOSE 4000

CMD ["npm", "start"]
