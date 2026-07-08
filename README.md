# LloroLog 💧

**LloroLog** es una aplicación web full-stack para registrar y analizar llantos en grupo. Diseñada para un pequeño círculo de amigos, permite a cada persona loguear sus lloros con una escala de intensidad de emojis del 1 al 10, ver patrones a lo largo del tiempo, comparar estadísticas con el grupo y recibir un poema reconfortante de inteligencia artificial inspirado en Federico García Lorca.

---

## Índice

1. [Características](#características)
2. [Stack tecnológico](#stack-tecnológico)
3. [Arquitectura del código](#arquitectura-del-código)
4. [Estructura de archivos](#estructura-de-archivos)
5. [Base de datos](#base-de-datos)
6. [API REST](#api-rest)
7. [Configuración del entorno](#configuración-del-entorno)
8. [Desarrollo local — setup automatizado (recomendado)](#desarrollo-local--setup-automatizado-recomendado)
9. [Guía de despliegue local — Mac M1 (manual)](#guía-de-despliegue-local--mac-m1-manual)
10. [Guía de despliegue local — Windows y Linux](#guía-de-despliegue-local--windows-y-linux)
11. [Despliegue en producción — IONOS](#despliegue-en-producción--ionos)
12. [Base de datos en IONOS](#base-de-datos-en-ionos)
13. [Variables de entorno completas](#variables-de-entorno-completas)
14. [Cómo extender la app](#cómo-extender-la-app)
15. [Monitorización en producción](#monitorización-en-producción)
16. [Solución de problemas](#solución-de-problemas)

---

## Características

| Función | Descripción |
|---|---|
| 🔐 Autenticación | Registro e inicio de sesión con email/contraseña y Google OAuth vía Clerk |
| 💧 Registro de lloros | Escala de intensidad 1–10 con emojis, duración, razón, tipo, detonante, notas |
| 🗓️ Mapa de calor | Vista estilo GitHub con todos los días del año |
| 📊 Tendencias | Gráficas por día de la semana, hora del día, tipo de lloro y ubicación |
| 🎬 Cry Wrapped | Resumen anual al estilo Spotify Wrapped con animaciones |
| 🌿 Calm Corner | Genera un poema reconfortante con IA (Claude / Anthropic) al estilo García Lorca |
| 🆘 Necesito ayuda | Botón especial que aparece al registrar intensidad 10 |
| 👥 Estadísticas de grupo | Vista compartida con todos los miembros |
| 👤 Perfiles públicos | Cada usuario tiene su perfil con su historial |
| 📸 Foto de perfil | Subida de foto directamente desde el perfil, sincronizada con Clerk |

---

## Stack tecnológico

### Frontend (`artifacts/lloroapp`)
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Librería de UI |
| Vite | 7 | Bundler y servidor de desarrollo |
| TypeScript | 5.9 | Tipado estático |
| Tailwind CSS v4 | latest | Estilos utilitarios |
| Framer Motion | latest | Animaciones (Wrapped) |
| Wouter | 3 | Enrutamiento del lado del cliente |
| @clerk/react | 6 | Autenticación (SDK cliente) |
| TanStack Query | 5 | Caché y fetching de datos |
| React Hook Form | 7 | Formularios |
| Zod | 3 | Validación de esquemas |
| Recharts | 2 | Gráficas de estadísticas |
| date-fns | 3 | Manipulación de fechas |
| Radix UI | latest | Componentes primitivos accesibles |
| shadcn/ui | latest | Sistema de componentes |

### Backend (`artifacts/api-server`)
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 24 | Runtime |
| Express | 5 | Framework HTTP |
| TypeScript | 5.9 | Tipado estático |
| @clerk/express | 2 | Middleware de autenticación servidor |
| Drizzle ORM | latest | ORM para PostgreSQL |
| Zod (drizzle-zod) | 3 | Validación de schemas desde la BD |
| Pino | 9 | Logging estructurado |
| esbuild | 0.27 | Compilación rápida para producción |
| Anthropic SDK | latest | Generación de poemas con IA |

### Base de datos y libs compartidas
| Paquete | Descripción |
|---|---|
| `@workspace/db` | Schema Drizzle + cliente PostgreSQL |
| `@workspace/api-spec` | Especificación OpenAPI 3.1 |
| `@workspace/api-zod` | Schemas Zod generados automáticamente desde el OpenAPI |
| `@workspace/api-client-react` | Hooks React Query generados automáticamente (Orval) |
| `@workspace/integrations-anthropic-ai` | Cliente Anthropic preconfigurado |

### Infraestructura
- **pnpm workspaces** — monorepo con packages independientes
- **Clerk** — gestión completa de usuarios, sesiones y OAuth
- **PostgreSQL** — base de datos relacional
- **Drizzle Kit** — migraciones y push de schema

---

## Arquitectura del código

```
Browser (React + Vite)
        │
        │  HTTPS  /           → Frontend (puerto 24342)
        │  HTTPS  /api/       → API Server (puerto 8080)
        │  HTTPS  /clerk/     → Proxy Clerk (gestionado por Express)
        ▼
   Reverse Proxy (NGINX en producción)
        │
        ├── artifacts/lloroapp      React SPA
        └── artifacts/api-server    Express API
                    │
                    ├── Clerk (autenticación JWT)
                    ├── PostgreSQL (datos de usuarios y lloros)
                    └── Anthropic API (generación de poemas)
```

### Flujo de autenticación

1. El usuario se registra/loguea con Clerk en el frontend.
2. Clerk devuelve una sesión con un JWT.
3. En cada petición al API, el middleware `clerkMiddleware()` de Express valida el token.
4. La primera vez que el usuario accede al dashboard, el frontend llama a `POST /api/users/sync` con nombre y email para crear el usuario en la tabla `users` de PostgreSQL, vinculado al `clerkId`.
5. A partir de ahí, todas las operaciones usan el `userId` interno de la BD (integer), no el `clerkId` (string de Clerk).

### Flujo de codegen (contrato API primero)

El proyecto usa un enfoque **contract-first**: el contrato entre frontend y backend es el fichero OpenAPI.

```
lib/api-spec/openapi.yaml
        │
        │  pnpm --filter @workspace/api-spec run codegen
        ▼
lib/api-zod/src/        ← Schemas Zod para validar en el servidor
lib/api-client-react/src/ ← Hooks React Query para el cliente
```

Si modificas la API, debes:
1. Editar `lib/api-spec/openapi.yaml`
2. Ejecutar `pnpm --filter @workspace/api-spec run codegen`
3. Los tipos, validaciones y hooks se regeneran automáticamente.

---

## Estructura de archivos

```
lloroLog/
├── artifacts/
│   ├── api-server/               # Servidor Express
│   │   ├── src/
│   │   │   ├── app.ts            # Configuración Express (CORS, Clerk, rutas)
│   │   │   ├── index.ts          # Punto de entrada, arranca el servidor
│   │   │   ├── routes/
│   │   │   │   ├── index.ts      # Monta todos los routers bajo /api
│   │   │   │   ├── health.ts     # GET /api/healthz
│   │   │   │   ├── users.ts      # GET /me, POST /sync, GET /:id, GET /
│   │   │   │   ├── cries.ts      # CRUD completo de lloros
│   │   │   │   ├── stats.ts      # Heatmap, tendencias, wrapped, overview
│   │   │   │   └── calm.ts       # POST /poem (Anthropic)
│   │   │   ├── lib/
│   │   │   │   └── logger.ts     # Logger Pino singleton
│   │   │   └── middlewares/
│   │   │       └── clerkProxyMiddleware.ts
│   │   └── package.json
│   │
│   └── lloroapp/                 # Frontend React
│       ├── src/
│       │   ├── App.tsx           # Rutas, ClerkProvider, QueryClientProvider
│       │   ├── main.tsx          # Punto de entrada React
│       │   ├── index.css         # Variables de tema, Tailwind
│       │   ├── pages/
│       │   │   ├── home.tsx      # Landing (usuarios no autenticados)
│       │   │   ├── dashboard.tsx # Panel principal del usuario
│       │   │   ├── add-cry.tsx   # Formulario de registro de lloro
│       │   │   ├── calm.tsx      # Rincón de la calma (poema IA)
│       │   │   ├── stats.tsx     # Estadísticas personales
│       │   │   ├── wrapped.tsx   # Cry Wrapped anual
│       │   │   ├── group.tsx     # Estadísticas de grupo
│       │   │   ├── profile.tsx   # Perfil del usuario (subida de foto)
│       │   │   └── user-profile.tsx # Perfil público de otro usuario
│       │   └── components/
│       │       ├── layout.tsx    # Barra de navegación, estructura
│       │       ├── heatmap.tsx   # Componente mapa de calor estilo GitHub
│       │       └── ui/           # Componentes shadcn/ui (button, card, etc.)
│       └── package.json
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml          # Contrato OpenAPI 3.1 (fuente de verdad)
│   ├── api-zod/                  # Schemas Zod generados (NO editar a mano)
│   ├── api-client-react/         # Hooks React Query generados (NO editar a mano)
│   ├── db/
│   │   ├── src/schema/
│   │   │   ├── users.ts          # Tabla users
│   │   │   ├── cries.ts          # Tabla cries
│   │   │   └── index.ts          # Barrel de exports
│   │   ├── drizzle.config.ts     # Configuración Drizzle Kit
│   │   └── package.json
│   └── integrations-anthropic-ai/  # Cliente Anthropic preconfigurado
│
├── pnpm-workspace.yaml           # Definición del monorepo
├── tsconfig.base.json            # Configuración TypeScript compartida
├── tsconfig.json                 # References de librerías compilables
└── package.json                  # Scripts raíz
```

---

## Base de datos

La base de datos es **PostgreSQL**. El schema se define en TypeScript con Drizzle ORM y se empuja directamente a la BD con `drizzle-kit push`.

### Tabla `users`

```sql
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  clerk_id   TEXT NOT NULL UNIQUE,  -- ID de Clerk ("user_xxxx")
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | integer | Clave primaria auto-incremental |
| `clerk_id` | text | ID único de Clerk, vincula sesión ↔ fila |
| `name` | text | Nombre completo del usuario |
| `email` | text | Correo electrónico |
| `created_at` | timestamptz | Fecha de registro |

### Tabla `cries`

```sql
CREATE TABLE cries (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES users(id),
  intensity        INTEGER NOT NULL,        -- 1 a 10
  occurred_at      TIMESTAMPTZ NOT NULL,    -- Cuándo ocurrió el lloro
  duration_minutes INTEGER,                 -- Duración en minutos (opcional)
  reason           TEXT,                    -- Razón breve (opcional)
  location         TEXT,                    -- Dónde estabas (opcional)
  was_alone        BOOLEAN,                 -- ¿Estabas solo/a?
  cry_type         TEXT,                    -- Tristeza | Estrés | Felicidad | …
  trigger          TEXT,                    -- Qué lo detonó
  notes            TEXT,                    -- Notas libres
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Tipos de lloro predefinidos
- Tristeza
- Estrés
- Felicidad
- Nostalgia
- Frustración
- Película/Arte
- Cortando cebolla

### Actualizar el schema

Si añades o cambias columnas, edita el archivo TypeScript del schema y ejecuta:

```bash
pnpm --filter @workspace/db run push
```

> ⚠️ `drizzle-kit push` es para desarrollo. En producción usa migraciones (ver sección IONOS).

---

## API REST

Todos los endpoints están bajo el prefijo `/api`.

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| GET | `/api/healthz` | — | Verificación de estado del servidor |
| GET | `/api/users/me` | ✅ | Perfil del usuario autenticado |
| POST | `/api/users/sync` | ✅ | Crear/actualizar usuario desde sesión Clerk |
| GET | `/api/users` | — | Lista todos los usuarios del grupo |
| GET | `/api/users/:userId` | — | Perfil público de un usuario |
| GET | `/api/cries` | — | Lista de lloros (con filtros de userId, limit, offset) |
| POST | `/api/cries` | ✅ | Registrar un nuevo lloro |
| GET | `/api/cries/:id` | — | Obtener un lloro por ID |
| PATCH | `/api/cries/:id` | ✅ | Editar un lloro propio |
| DELETE | `/api/cries/:id` | ✅ | Eliminar un lloro propio |
| GET | `/api/stats/heatmap` | — | Datos de mapa de calor por día |
| GET | `/api/stats/trends` | — | Análisis de tendencias |
| GET | `/api/stats/wrapped` | — | Resumen anual Cry Wrapped |
| GET | `/api/stats/overview` | — | Estadísticas generales |
| POST | `/api/calm/poem` | — | Generar poema Lorca con IA |

---

## Configuración del entorno

Crea un archivo `.env` en la raíz del proyecto. Hay una plantilla completa en `.env.example`:

```bash
cp .env.example .env
# Edita .env con tus claves reales
```

```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/lloroLog

# Clerk (autenticación)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

# Anthropic (poemas IA)
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx

# Sesión (string aleatorio seguro)
SESSION_SECRET=una_cadena_muy_larga_y_aleatoria_aqui
```

---

## Desarrollo local — setup automatizado (recomendado)

Esta es la forma más rápida de arrancar en cualquier sistema. Usa Docker para la base de datos (no hace falta instalar PostgreSQL manualmente) y gestiona automáticamente el problema de binarios en Mac M1.

### Requisitos

- **Node.js 24+** ([descargar](https://nodejs.org))
- **pnpm 10+** (`npm install -g pnpm`)
- **Docker Desktop** ([descargar](https://www.docker.com/products/docker-desktop/)) — para la base de datos

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/lloroLog.git
cd lloroLog

# 2. Setup inicial (solo una vez)
pnpm run setup
```

El script `setup` hace automáticamente:
- Detecta si estás en Mac M1 y usa el workspace config correcto para que `esbuild`, `rollup`, `tailwindcss` y `lightningcss` instalen sus binarios nativos para `darwin-arm64`
- Crea `.env` desde `.env.example` y te pide que edites tus claves
- Levanta PostgreSQL con Docker
- Crea las tablas en la BD

```bash
# 3. Arrancar en desarrollo
pnpm run dev
```

Esto lanza el API y el frontend juntos en la misma terminal con salida coloreada.

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8080/api/healthz |
| Adminer (BD) | http://localhost:8888 |

> El frontend usa `vite.config.local.ts` en lugar del config de Replit. La diferencia clave es que añade un proxy para `/api → localhost:8080`, lo que hace que las llamadas al backend funcionen exactamente igual que en Replit.

### Scripts disponibles desde la raíz

| Comando | Descripción |
|---|---|
| `pnpm run setup` | Setup inicial (instalar, levantar Docker, crear tablas) |
| `pnpm run dev` | Arrancar frontend + API juntos |
| `pnpm run dev:api` | Solo el backend Express |
| `pnpm run dev:web` | Solo el frontend Vite |
| `pnpm run db:push` | Aplicar cambios de schema a la BD |
| `pnpm run codegen` | Regenerar hooks y Zod schemas desde OpenAPI |
| `pnpm run typecheck` | Verificar tipos en todo el monorepo |

### Base de datos con Docker

```bash
# Levantar la base de datos
docker compose up -d db

# Ver los logs de PostgreSQL
docker compose logs -f db

# Parar todos los contenedores
docker compose down

# Parar y borrar los datos (¡destructivo!)
docker compose down -v
```

---

## Guía de despliegue local — Mac M1 (manual)

### 1. Requisitos previos

#### Instalar Homebrew (gestor de paquetes para macOS)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Sigue las instrucciones al final de la instalación para añadir Homebrew al PATH en chips Apple Silicon:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### Instalar Node.js 24
```bash
brew install node@24
echo 'export PATH="/opt/homebrew/opt/node@24/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
node --version   # debe mostrar v24.x.x
```

#### Instalar pnpm
```bash
npm install -g pnpm
pnpm --version   # debe mostrar 10.x.x
```

#### Instalar PostgreSQL en Mac M1
```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

Verificar que PostgreSQL está corriendo:
```bash
pg_isready
# output: /tmp:5432 - accepting connections
```

### 2. Crear la base de datos

```bash
# Conectar al servidor PostgreSQL local
psql postgres

# Dentro de psql:
CREATE DATABASE lloroLog;
CREATE USER llorouser WITH ENCRYPTED PASSWORD 'tu_contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE lloroLog TO llorouser;
\q
```

Anota la URL de conexión: `postgresql://llorouser:tu_contraseña_segura@localhost:5432/lloroLog`

### 3. Clonar y configurar el proyecto

```bash
git clone https://github.com/tu-usuario/lloroLog.git
cd lloroLog
```

Crear el archivo de variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tu editor favorito:
```bash
nano .env
# o
code .env
```

Pegar las variables del apartado [Configuración del entorno](#configuración-del-entorno) con tus valores reales.

### 4. Instalar dependencias

```bash
pnpm install
```

### 5. Crear las tablas en la base de datos

```bash
pnpm --filter @workspace/db run push
```

Deberías ver:
```
[✓] Pulling schema from database...
[✓] Changes applied
```

### 6. Generar código del cliente (opcional, si modificas la API)

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 7. Ejecutar en desarrollo

Necesitas dos terminales abiertas:

**Terminal 1 — Backend:**
```bash
pnpm --filter @workspace/api-server run dev
# Servidor escuchando en http://localhost:8080
```

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/lloroapp run dev
# App disponible en http://localhost:24342
```

Abre el navegador en `http://localhost:24342`.

> **Nota:** Si usas el script automatizado (`pnpm run dev`), el proxy ya está configurado en `vite.config.local.ts` — las llamadas a `/api` llegan a Express automáticamente. Si arrancas Vite manualmente con `vite.config.ts` (el config de Replit), necesitarás un proxy inverso local (Nginx, Caddy) porque ese config no incluye proxy.

### 8. Verificar que todo funciona

```bash
# En otra terminal, probar el API
curl http://localhost:8080/api/healthz
# {"status":"ok"}
```

---

## Guía de despliegue local — Windows y Linux

### Windows

#### Opción A: WSL2 (recomendado)

1. Instalar WSL2:
```powershell
# En PowerShell como Administrador:
wsl --install
# Reiniciar el equipo
```

2. Una vez dentro de Ubuntu en WSL2, seguir los mismos pasos que en Linux (ver abajo).

#### Opción B: Nativo en Windows

1. Descargar e instalar **Node.js 24** desde https://nodejs.org/en/download
2. Instalar pnpm:
```cmd
npm install -g pnpm
```
3. Instalar **PostgreSQL 16** desde https://www.postgresql.org/download/windows/
   - Durante la instalación, recuerda la contraseña del usuario `postgres`
4. Crear la base de datos desde pgAdmin (incluido en la instalación) o con `psql`:
```sql
CREATE DATABASE lloroLog;
CREATE USER llorouser WITH ENCRYPTED PASSWORD 'tu_contraseña';
GRANT ALL PRIVILEGES ON DATABASE lloroLog TO llorouser;
```
5. Continuar desde el [paso 3](#3-clonar-y-configurar-el-proyecto) de la guía Mac.

### Linux (Ubuntu/Debian)

```bash
# Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm

# PostgreSQL 16
sudo apt-get install -y postgresql-16
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE DATABASE lloroLog;"
sudo -u postgres psql -c "CREATE USER llorouser WITH ENCRYPTED PASSWORD 'contraseña';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lloroLog TO llorouser;"
```

A partir de aquí, seguir desde el [paso 3](#3-clonar-y-configurar-el-proyecto) de la guía Mac (los comandos son idénticos).

---

## Despliegue en producción — IONOS

IONOS ofrece servidores VPS con acceso root completo. Esta guía usa **IONOS VPS Linux** (Ubuntu 22.04 LTS).

### 1. Contratar y acceder al servidor

1. En el panel de IONOS, contrata un **VPS Linux** (mínimo recomendado: 2 vCPU, 4 GB RAM).
2. Elige **Ubuntu 22.04 LTS** como sistema operativo.
3. Guarda la IP del servidor y las credenciales de acceso.
4. Conectarte por SSH:
```bash
ssh root@TU_IP_DEL_SERVIDOR
```

### 2. Preparar el servidor

```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Instalar utilidades básicas
apt install -y git curl wget build-essential

# Instalar Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs
node --version   # v24.x.x

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (gestor de procesos para producción)
npm install -g pm2

# Instalar Nginx (proxy inverso)
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 3. Crear usuario de despliegue (buena práctica de seguridad)

```bash
adduser lloroapp
usermod -aG sudo lloroapp
su - lloroapp
```

### 4. Desplegar el código

```bash
# En el servidor, como usuario lloroapp:
git clone https://github.com/tu-usuario/lloroLog.git /home/lloroapp/lloroLog
cd /home/lloroapp/lloroLog

# Instalar dependencias
pnpm install --frozen-lockfile

# Generar el build del frontend
pnpm --filter @workspace/lloroapp run build
# El build estático queda en artifacts/lloroapp/dist/

# Compilar el backend
pnpm --filter @workspace/api-server run build
# El bundle queda en artifacts/api-server/dist/index.mjs
```

### 5. Configurar variables de entorno en el servidor

```bash
nano /home/lloroapp/lloroLog/.env
```

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://llorouser:contraseña@localhost:5432/lloroLog
CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxx
AI_INTEGRATIONS_ANTHROPIC_BASE_URL=https://api.anthropic.com
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
SESSION_SECRET=cadena_muy_larga_y_aleatoria_generada_con_openssl
```

Para generar un SESSION_SECRET seguro:
```bash
openssl rand -hex 64
```

### 6. Iniciar el servidor con PM2

```bash
cd /home/lloroapp/lloroLog

# Crear fichero de configuración PM2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'lloroLog-api',
    script: './artifacts/api-server/dist/index.mjs',
    cwd: '/home/lloroapp/lloroLog',
    env_file: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--enable-source-maps'
  }]
};
EOF

# Arrancar la aplicación
pm2 start ecosystem.config.cjs

# Guardar la configuración para que arranque automáticamente al reiniciar
pm2 save
pm2 startup systemd
# Ejecuta el comando que PM2 te muestre (empieza por "sudo env PATH=...")
```

Verificar que está corriendo:
```bash
pm2 status
pm2 logs lloroLog-api
```

### 7. Configurar Nginx como proxy inverso

Este paso es clave: Nginx sirve el frontend estático y redirige las llamadas a `/api` al proceso Node.js.

```bash
# Crear configuración Nginx
nano /etc/nginx/sites-available/lloroLog
```

Pegar esta configuración (sustituye `tudominio.com` por tu dominio real):

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Servir el frontend React estático
    root /home/lloroapp/lloroLog/artifacts/lloroapp/dist;
    index index.html;

    # Todas las rutas del frontend van a index.html (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Redirigir las llamadas al API al servidor Node.js
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy del sistema de autenticación Clerk
    location /clerk/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activar la configuración:
```bash
ln -s /etc/nginx/sites-available/lloroLog /etc/nginx/sites-enabled/
nginx -t          # Verificar que la sintaxis es correcta
systemctl reload nginx
```

### 8. Configurar HTTPS con Let's Encrypt (obligatorio para Clerk)

Clerk **requiere HTTPS** para funcionar en producción. Instala Certbot:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tudominio.com -d www.tudominio.com
# Sigue las instrucciones en pantalla, introduce tu email y acepta los términos
```

Certbot modifica automáticamente la configuración de Nginx para añadir SSL y redirigir HTTP → HTTPS. La renovación del certificado es automática.

### 9. Apuntar el dominio de IONOS al servidor

En el panel de control de IONOS:
1. Ve a **Dominios** → selecciona tu dominio → **DNS**.
2. Crea o edita el registro `A`:
   - **Host:** `@` (o `tudominio.com`)
   - **Valor/Destino:** `TU_IP_DEL_SERVIDOR`
   - **TTL:** 3600
3. Si quieres también `www`, crea un registro `CNAME`:
   - **Host:** `www`
   - **Valor:** `@`

Los cambios DNS tardan entre 15 minutos y 48 horas en propagarse.

### 10. Actualizar la app en producción

Cada vez que hagas cambios:

```bash
cd /home/lloroapp/lloroLog
git pull origin main
pnpm install --frozen-lockfile
pnpm --filter @workspace/lloroapp run build
pnpm --filter @workspace/api-server run build
pm2 restart lloroLog-api
```

---

## Base de datos en IONOS

### Instalación de PostgreSQL en el VPS de IONOS

```bash
# Instalar PostgreSQL 16
apt install -y postgresql-16 postgresql-client-16
systemctl start postgresql
systemctl enable postgresql
```

### Crear base de datos y usuario

```bash
# Conectar como superusuario postgres
sudo -u postgres psql
```

Dentro de psql:
```sql
-- Crear base de datos
CREATE DATABASE lloroLog;

-- Crear usuario con contraseña segura (cámbiala por una tuya)
CREATE USER llorouser WITH ENCRYPTED PASSWORD 'ContraseñaMuySegura2024!';

-- Dar permisos completos sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE lloroLog TO llorouser;

-- En PostgreSQL 15+, también hay que dar permisos sobre el schema public
\c lloroLog
GRANT ALL ON SCHEMA public TO llorouser;

-- Salir
\q
```

### Ejecutar las migraciones

Con el archivo `.env` configurado en el servidor:

```bash
cd /home/lloroapp/lloroLog
pnpm --filter @workspace/db run push
```

Verás:
```
[✓] Pulling schema from database...
[✓] Changes applied
```

Esto crea las tablas `users` y `cries` automáticamente.

### Configurar PostgreSQL para acceso seguro (solo local)

Por defecto, PostgreSQL en Ubuntu solo acepta conexiones locales, lo que es correcto y seguro. El servidor Express se conecta a través del socket Unix local, por lo que no necesitas abrir puertos hacia internet.

Para verificar la configuración:
```bash
cat /etc/postgresql/16/main/pg_hba.conf
# La línea importante es:
# local   all   all   peer
# host    all   all   127.0.0.1/32   scram-sha-256
```

### Migraciones en producción (enfoque seguro)

Para entornos de producción consolidados, en lugar de usar `drizzle-kit push` (que compara y aplica diferencias), es mejor generar migraciones versionadas:

```bash
# En tu máquina de desarrollo, generar la migración:
pnpm --filter @workspace/db run generate
# Esto crea un fichero SQL en lib/db/drizzle/

# Subir el código al servidor y aplicar:
pnpm --filter @workspace/db run migrate
```

Para habilitar `generate` y `migrate` añade estos scripts a `lib/db/package.json`:
```json
"generate": "drizzle-kit generate",
"migrate": "drizzle-kit migrate"
```

### Backup automático de la base de datos

Configurar un backup diario con cron:

```bash
# Crear script de backup
mkdir -p /home/lloroapp/backups
cat > /home/lloroapp/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/home/lloroapp/backups
pg_dump -U llorouser -h localhost lloroLog > $BACKUP_DIR/lloroLog_$DATE.sql
# Eliminar backups de más de 30 días
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
EOF

chmod +x /home/lloroapp/backup-db.sh

# Configurar cron para ejecutarlo cada día a las 3:00 AM
crontab -e
# Añadir esta línea:
# 0 3 * * * /home/lloroapp/backup-db.sh
```

### Restaurar un backup

```bash
psql -U llorouser -h localhost lloroLog < /home/lloroapp/backups/lloroLog_FECHA.sql
```

---

## Variables de entorno completas

| Variable | Dónde obtenerla | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Tu servidor PostgreSQL | `postgresql://user:pass@localhost:5432/lloroLog` |
| `CLERK_PUBLISHABLE_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) → tu app → API Keys | `pk_live_xxxx` |
| `CLERK_SECRET_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) → tu app → API Keys | `sk_live_xxxx` |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Fijo | `https://api.anthropic.com` |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys | `sk-ant-xxxx` |
| `SESSION_SECRET` | Genera con `openssl rand -hex 64` | cadena de 128 caracteres hex |
| `PORT` | Solo en producción | `8080` |
| `NODE_ENV` | Solo en producción | `production` |

### Configurar Clerk para producción

Cuando pasas de desarrollo a producción en Clerk:
1. En [dashboard.clerk.com](https://dashboard.clerk.com), cambia tu aplicación de **Development** a **Production**.
2. Obtén las nuevas claves `pk_live_` y `sk_live_`.
3. En la configuración de Clerk, añade tu dominio en **Allowed Origins**: `https://tudominio.com`.
4. Activa los proveedores OAuth que quieras (Google, etc.) con tus propias credenciales de Google Cloud Console.

---

## Comandos de referencia rápida

```bash
# ── Setup y desarrollo local ─────────────────────────────────

# Setup inicial (solo una vez, Mac M1 / Linux / Windows WSL)
pnpm run setup

# Arrancar frontend + API juntos en local
pnpm run dev

# Solo el backend Express
pnpm run dev:api

# Solo el frontend Vite
pnpm run dev:web

# ── Base de datos ─────────────────────────────────────────────

# Aplicar cambios de schema a la BD (desarrollo)
pnpm run db:push
# o más explícitamente:
pnpm --filter @workspace/db run push

# Levantar solo PostgreSQL con Docker
docker compose up -d db

# ── Código generado (OpenAPI) ─────────────────────────────────

# Regenerar hooks React Query y schemas Zod desde openapi.yaml
pnpm run codegen
# o:
pnpm --filter @workspace/api-spec run codegen

# ── TypeScript ────────────────────────────────────────────────

# Verificar tipos en todo el monorepo
pnpm run typecheck

# Solo las librerías compartidas (más rápido)
pnpm run typecheck:libs

# ── Build para producción ─────────────────────────────────────

# Frontend (genera artifacts/lloroapp/dist/)
pnpm --filter @workspace/lloroapp run build

# Backend (genera artifacts/api-server/dist/index.mjs)
pnpm --filter @workspace/api-server run build

# ── Producción (PM2) ──────────────────────────────────────────

# Ver logs en tiempo real
pm2 logs lloroLog-api

# Reiniciar el servidor
pm2 restart lloroLog-api

# Estado de los procesos
pm2 status

# Monitorización interactiva (CPU, memoria, logs)
pm2 monit

# ── Base de datos — operaciones de producción ─────────────────

# Backup manual
pg_dump -U llorouser -h localhost lloroLog > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U llorouser -h localhost lloroLog < backup_FECHA.sql
```

---

## Cómo extender la app

### Añadir un nuevo campo a los lloros

1. Editar el schema en `lib/db/src/schema/cries.ts`:
   ```ts
   export const cries = pgTable("cries", {
     // ... campos existentes ...
     newField: text("new_field"),  // ← añadir aquí
   });
   ```

2. Aplicar el cambio a la BD:
   ```bash
   pnpm run db:push
   ```

3. Actualizar el contrato OpenAPI en `lib/api-spec/openapi.yaml` (añadir el campo al schema `Cry`).

4. Regenerar código:
   ```bash
   pnpm run codegen
   ```

5. El backend ya puede leer/escribir el campo. Actualizar la ruta correspondiente en `artifacts/api-server/src/routes/cries.ts` si es necesario.

### Añadir un nuevo endpoint al API

1. Añadir el endpoint a `lib/api-spec/openapi.yaml` (definir path, parámetros, response schema).

2. Regenerar código:
   ```bash
   pnpm run codegen
   ```

3. Crear o editar el router en `artifacts/api-server/src/routes/`.

4. Registrar el router en `artifacts/api-server/src/routes/index.ts`.

5. En el frontend, el hook generado ya estará disponible en `@workspace/api-client-react`.

### Añadir una nueva página al frontend

1. Crear el componente en `artifacts/lloroapp/src/pages/nueva-pagina.tsx`.

2. Añadir la ruta en `artifacts/lloroapp/src/App.tsx`:
   ```tsx
   <Route path="/nueva-pagina" component={NuevaPagina} />
   ```

3. Si debe aparecer en la navegación, añadir el tab en `artifacts/lloroapp/src/components/layout.tsx`.

---

## Monitorización en producción

### PM2 — estado del proceso

```bash
pm2 status           # Estado rápido de todos los procesos
pm2 monit            # Dashboard interactivo (CPU, memoria, logs)
pm2 logs lloroLog-api --lines 100   # Últimas 100 líneas de log
pm2 logs lloroLog-api --err          # Solo errores
```

### Nginx — logs de acceso y errores

```bash
# Accesos en tiempo real
tail -f /var/log/nginx/access.log

# Errores
tail -f /var/log/nginx/error.log

# Tráfico de la última hora
awk -v d="$(date +'%d/%b/%Y:%H')" '$0 ~ d' /var/log/nginx/access.log | wc -l
```

### PostgreSQL — estado y consultas lentas

```bash
# Conectar a la BD
sudo -u postgres psql -d lloroLog

# Conexiones activas
SELECT count(*) FROM pg_stat_activity WHERE datname = 'lloroLog';

# Tamaño de la BD
SELECT pg_size_pretty(pg_database_size('lloroLog'));

# Filas por tabla
SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;
```

### Alertas rápidas de disponibilidad

Para comprobar que todo funciona desde el servidor:

```bash
# ¿Responde el API?
curl -s http://localhost:8080/api/healthz

# ¿Responde Nginx?
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/healthz

# ¿Está PostgreSQL activo?
pg_isready -U llorouser -d lloroLog
```

---

## Solución de problemas

### `pnpm install` falla en Mac M1 con errores de binarios

**Síntoma:** Errores como `Cannot find module '@esbuild/darwin-arm64'` o `EBADPLATFORM`.

**Causa:** `pnpm-workspace.yaml` tiene overrides que excluyen los binarios `darwin-arm64` (necesarios para Replit, que solo usa `linux-x64`).

**Solución:** Usa el script automatizado que parchea el workspace temporalmente:
```bash
pnpm run setup
```
O manualmente:
```bash
cp pnpm-workspace.yaml pnpm-workspace.replit.yaml
cp pnpm-workspace.local.yaml pnpm-workspace.yaml
pnpm install --no-frozen-lockfile
cp pnpm-workspace.replit.yaml pnpm-workspace.yaml
```

---

### El frontend no se conecta al API en local

**Síntoma:** Errores `404` o `Failed to fetch` al llamar a `/api/...` desde el navegador.

**Causa:** Vite no tiene configurado el proxy para reenviar `/api` a Express.

**Solución:** Asegúrate de que estás usando `vite.config.local.ts` (el que usa `pnpm run dev:web`) y no el `vite.config.ts` de Replit. El config local incluye el proxy automáticamente.

---

### Error de Clerk: `clerkMiddleware is not defined` o errores de JWKS

**Síntoma:** El API responde con errores 401 o el frontend muestra errores de autenticación.

**Causa:** Las claves `CLERK_PUBLISHABLE_KEY` o `CLERK_SECRET_KEY` están vacías o son incorrectas.

**Solución:**
1. Verifica que `.env` tiene los valores correctos.
2. Asegúrate de usar claves de **desarrollo** (`pk_test_` / `sk_test_`) para local.
3. El servidor Express debe cargarse **después** de que las variables de entorno estén disponibles (el script `start-api.sh` hace `source .env` automáticamente).

---

### La base de datos no arranca con Docker

**Síntoma:** `docker compose up -d db` falla o el healthcheck nunca pasa.

**Solución:**
```bash
# Ver los logs del contenedor
docker compose logs db

# Verificar que el puerto 5432 no está ocupado por otra instancia de Postgres
lsof -i :5432

# Si hay un Postgres local corriendo (Homebrew), pararlo primero
brew services stop postgresql@16

# Reiniciar Docker Desktop completamente si hay problemas de red
```

---

### `pnpm run db:push` falla con "permission denied"

**Síntoma:** Error al crear tablas: `ERROR: permission denied for schema public`.

**Causa:** En PostgreSQL 15+, el usuario de la BD no tiene permisos sobre el schema `public` por defecto.

**Solución:**
```bash
sudo -u postgres psql -d lloroLog -c "GRANT ALL ON SCHEMA public TO llorouser;"
```

---

### PM2 no arranca el servidor tras reiniciar el VPS

**Síntoma:** El servidor parece caído después de un reinicio.

**Causa:** No se configuró PM2 para arranque automático.

**Solución:**
```bash
pm2 save
pm2 startup systemd
# Ejecuta el comando que PM2 muestre (comienza con "sudo env PATH=...")
```

---

*LloroLog — porque llorar también merece su analytics* 💧
