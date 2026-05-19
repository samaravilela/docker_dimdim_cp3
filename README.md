# DimDimApp — Checkpoint 3 (Dockerfile)

API REST em Node.js + PostgreSQL para o projeto **DimDim** (instituição financeira fictícia), com dois containers Docker, volume nomeado, rede compartilhada e imagem personalizada da aplicação.

## Equipe

| Integrante | RM |
|------------|-----|
| Nickolas Davi | 564105 |
| Samara Vilela | 566133 |
| Natalia Silva | 564099 |

**Representante:** Samara Vilela (**RM566133**) — o RM do representante compõe o nome dos containers: `dimdim-db-RM566133` e `dimdim-app-RM566133`.

## Estrutura do projeto

```
.
├── Dockerfile
├── package.json
├── src/
│   ├── db.js
│   └── server.js
├── scripts/
│   └── run-cloud.sh
└── README.md
```

## Pré-requisitos (VM em nuvem)

Execute **em uma máquina virtual na nuvem** (AWS EC2, Azure VM, Google Compute Engine, etc.). O checkpoint **não** aceita evidências apenas em `localhost` da sua máquina pessoal.

Na VM:

```bash
sudo apt-get update && sudo apt-get install -y docker.io git curl
sudo usermod -aG docker $USER
newgrp docker
```

## How to — do clone à execução

### 1. Clonar o repositório

```bash
git clone git@github.com:samaravilela/docker_dimdim_cp3.git
cd dimdimapp
```

### 2. Definir o RM do representante

```bash
export RM=RM566133
```

### 3. Criar rede Docker

```bash
docker network create dimdim-net-${RM}
```

### 4. Criar volume nomeado (persistência)

```bash
docker volume create dimdim-pgdata-${RM}
```

### 5. Subir o banco de dados (imagem pública)

```bash
docker run -d \
  --name dimdim-db-${RM} \
  --network dimdim-net-${RM} \
  -e POSTGRES_USER=dimdim \
  -e POSTGRES_PASSWORD=dimdim123 \
  -e POSTGRES_DB=dimdimdb \
  -v dimdim-pgdata-${RM}:/var/lib/postgresql/data \
  postgres:16-alpine
```

Aguarde alguns segundos para o PostgreSQL iniciar.

### 6. Build da imagem personalizada da aplicação

```bash
docker build -t dimdimapp:${RM} .
```

### 7. Subir a aplicação (usuário não root, variáveis de ambiente)

```bash
docker run -d \
  --name dimdim-app-${RM} \
  -p 3000:3000 \
  --network dimdim-net-${RM} \
  -e APP_NAME=dimdimapp \
  -e APP_PORT=3000 \
  -e DB_HOST=dimdim-db-${RM} \
  -e DB_PORT=5432 \
  -e DB_USER=dimdim \
  -e DB_PASSWORD=dimdim123 \
  -e DB_NAME=dimdimdb \
  dimdimapp:${RM}
```

**Atalho:** após definir `RM`, você pode usar `./scripts/run-cloud.sh`.

### 8. Verificar containers em background

```bash
docker ps
```

## Evidências com `docker exec`

### Container da aplicação (usuário não root)

```bash
docker exec -it dimdim-app-${RM} sh -c "pwd && ls -la && whoami"
```

Esperado: diretório `/app`, usuário `dimdim`.

### Container do banco

```bash
docker exec -it dimdim-db-${RM} sh -c "pwd && ls -la && whoami"
```

## Testes do CRUD (API)

Substitua `IP_DA_VM` pelo IP público da sua VM.

```bash
export API=http://IP_DA_VM:3000

# CREATE
curl -s -X POST "$API/contas" \
  -H "Content-Type: application/json" \
  -d '{"titular":"Maria Silva","saldo":1500.50}'

# READ (lista)
curl -s "$API/contas"

# READ (por id)
curl -s "$API/contas/1"

# UPDATE
curl -s -X PUT "$API/contas/1" \
  -H "Content-Type: application/json" \
  -d '{"saldo":2000.00}'

# DELETE
curl -s -X DELETE "$API/contas/1"
```

## Evidências no banco (SELECT direto)

Após cada operação do CRUD, registre no vídeo um `SELECT` no PostgreSQL:

```bash
docker exec -it dimdim-db-${RM} psql -U dimdim -d dimdimdb -c "SELECT * FROM contas;"
```

## Persistência de dados

1. Crie uma conta via API.
2. Pare e remova **apenas** o container do banco (o volume permanece):

```bash
docker stop dimdim-db-${RM}
docker rm dimdim-db-${RM}
```

3. Suba o banco novamente com o **mesmo** volume nomeado `dimdim-pgdata-${RM}`.
4. Execute o `SELECT` — os dados devem continuar existindo.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status da API |
| GET | `/contas` | Listar contas |
| GET | `/contas/:id` | Buscar conta |
| POST | `/contas` | Criar conta |
| PUT | `/contas/:id` | Atualizar conta |
| DELETE | `/contas/:id` | Remover conta |

## Requisitos atendidos

| Requisito | Implementação |
|-----------|----------------|
| Dois containers | PostgreSQL + API Node.js |
| Volume nomeado | `dimdim-pgdata-${RM}` |
| Rede Docker | `dimdim-net-${RM}` |
| Dockerfile da app | `Dockerfile` com imagem `dimdimapp:${RM}` |
| Usuário não root | usuário `dimdim` no Dockerfile |
| WORKDIR | `/app` |
| Variáveis de ambiente | `APP_NAME`, `DB_*`, etc. |
| CRUD | rotas `/contas` |
| Nomes com RM | `dimdim-db-${RM}`, `dimdim-app-${RM}` |
| Execução em nuvem | VM com IP público |

## Entrega (PDF + vídeo)

Arquivo `cp3_nomeEquipe.pdf` com:

- Nome da equipe e RMs
- Link do GitHub
- Link do YouTube (720p+, áudio claro, explicando cada passo)

No vídeo, siga este README do clone até os `SELECT` no banco após cada operação CRUD.

## Limpeza

```bash
docker stop dimdim-app-${RM} dimdim-db-${RM}
docker rm dimdim-app-${RM} dimdim-db-${RM}
docker network rm dimdim-net-${RM}
docker volume rm dimdim-pgdata-${RM}
docker rmi dimdimapp:${RM}
```
