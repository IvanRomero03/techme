# Manual Tecnico

## Prerequisitos

El projecto depende de la siguiente arquitectura de software que requiere de los modulos descritos en el diagrama
![image](https://github.com/user-attachments/assets/07431f73-4316-40fb-892d-a2c9e624729a)

Este repositorio almacena el codigo fuente de la aplicación de Next. Para lo cual se deberán proporcionar las siguientes variantes de entorno:

```env
# DB
DATABASE_URL="***"
DATABASE_PW="***"
# Next Auth
# You can generate a new secret on the command line with:
# openssl rand -base64 32
# https://next-auth.js.org/configuration/options#secret
NEXTAUTH_SECRET="***"
NEXTAUTH_URL="http://localhost:3000"


AZURE_AD_CLIENT_ID="***"
AZURE_AD_CLIENT_SECRET="***"
GOOGLE_CLIENT_ID="***"
GOOGLE_CLIENT_SECRET="***"
AZURE_AD_TENANT_ID="***"

NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY="***"
LIVEBLOCKS_SECRET_API_KEY="***"
NEXT_PUBLIC_OPENAI_API_KEY="***"
NEXT_PUBLIC_OPENAI_ORGANIZATION="***"

REDIS_URL="***"

CI_EMAIL="***"
CI_NAME="***"
CI_PASSWORD="***"

SUPABASE_BASE_URL="***"
SUPABASE_ANON_KEY="***"
SUPABASE_SECRET_KEY="***"

SMTP_EMAIL="***"
SMTP_PASSWORD="***"
SMTP_NAME="***"
```

## Instalacion del repositorio

```
git clone https://github.com/IvanRomero03/techme.git
```
```
npm install --global yarn
```
```
yarn install
```

## Servidor de desarrollo
```
yarn dev
```

## Build de produccion
Es recomendado utilizar vercel por la facilidad de hacer el deployment de produccion con bajo costo para nextjs
Crear build
```
yarn build
```
Serve
```
yarn start
```

