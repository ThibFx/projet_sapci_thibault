# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copier les fichiers de dependances
COPY package*.json ./

# Installer les dependances
RUN npm ci

# Copier le code source
COPY . .

# Build de production
RUN npm run build -- --configuration=production

# Production stage
FROM nginx:alpine

# Copier les fichiers build
COPY --from=build /app/dist/front/browser /usr/share/nginx/html

# Copier la configuration nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Demarrer nginx
CMD ["nginx", "-g", "daemon off;"]
