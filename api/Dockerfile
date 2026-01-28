# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copier les fichiers de dependances
COPY package*.json ./

# Installer toutes les dependances (incluant devDependencies pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copier les fichiers de dependances
COPY package*.json ./

# Installer uniquement les dependances de production
RUN npm ci --only=production

# Copier les fichiers build
COPY --from=build /app/dist ./dist

# Creer le dossier uploads
RUN mkdir -p uploads

# Exposer le port 3000
EXPOSE 3000

# Variables d'environnement par defaut
ENV NODE_ENV=production
ENV PORT=3000

# Demarrer l'application
CMD ["node", "dist/app.js"]
