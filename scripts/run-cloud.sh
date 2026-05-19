#!/usr/bin/env bash
set -euo pipefail

# Equipe: Nickolas Davi (564105), Samara Vilela (566133), Natalia Silva (564099)
# Representante: Samara Vilela — RM566133
RM="${RM:-RM566133}"

NETWORK="dimdim-net-${RM}"
VOLUME="dimdim-pgdata-${RM}"
DB_CONTAINER="dimdim-db-${RM}"
APP_CONTAINER="dimdim-app-${RM}"
IMAGE_APP="dimdimapp:${RM}"

echo "==> Rede Docker"
docker network create "${NETWORK}" 2>/dev/null || true

echo "==> Volume nomeado"
docker volume create "${VOLUME}" >/dev/null

echo "==> Container do banco (PostgreSQL)"
docker run -d \
  --name "${DB_CONTAINER}" \
  --network "${NETWORK}" \
  -e POSTGRES_USER=dimdim \
  -e POSTGRES_PASSWORD=dimdim123 \
  -e POSTGRES_DB=dimdimdb \
  -v "${VOLUME}:/var/lib/postgresql/data" \
  postgres:16-alpine

echo "Aguardando PostgreSQL..."
sleep 8

echo "==> Build da imagem da aplicação"
docker build -t "${IMAGE_APP}" .

echo "==> Container da aplicação"
docker run -d \
  --name "${APP_CONTAINER}" \
  -p 3000:3000 \
  --network "${NETWORK}" \
  -e APP_NAME=dimdimapp \
  -e APP_PORT=3000 \
  -e DB_HOST="${DB_CONTAINER}" \
  -e DB_PORT=5432 \
  -e DB_USER=dimdim \
  -e DB_PASSWORD=dimdim123 \
  -e DB_NAME=dimdimdb \
  "${IMAGE_APP}"

echo ""
echo "Containers em execução:"
docker ps --filter "name=dimdim"
