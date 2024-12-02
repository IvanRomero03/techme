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

A continuacion se hará un listado de proveedores importantes y como acceder a sus variables de entorno:
- Auth:
  - [Azure-AD](https://next-auth.js.org/providers/azure-ad)
  - [Google](https://next-auth.js.org/providers/google)
- Supabase:
  - [Get-API-Key](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs#get-the-api-keys)
- Postgresql:
  - [Local-Sample](https://orm.drizzle.team/docs/guides/postgresql-local-setup)
- SMTP:
  - [GMAIL-PW](https://www.gmass.co/blog/gmail-smtp/)
- Cache:
  - [Compatible redis url](https://github.com/redis/lettuce/wiki/Redis-URI-and-connection-details)
- LiveBlocks:
  - [AuthSession](https://liveblocks.io/docs/authentication/access-token) 

## Instalacion del repositorio

```PowerShell
git clone https://github.com/IvanRomero03/techme.git
```
```PowerShell
npm install --global yarn
```
```PowerShell
yarn install
```

## Configuracion de la base de datos

```PowerShell
yarn db:push
```

Utilizar el siguiente query para crear store procedure para embeddings:
```sql
DROP FUNCTION similarity_search_documents(vector, bigint);
create or replace function similarity_search_documents(embeddingin vector(1536), match_count bigint)
returns table (similarity float, texto text, document_id varchar(255))
language plpgsql
as $$
begin
return query
select
    (public.techme_document_embeddings.embedding <#> embeddingin) * -1 as similarity,
    public.techme_document_embeddings.text,
    public.techme_document_embeddings.document_id
FROM public.techme_document_embeddings
order by public.techme_document_embeddings.embedding <#> embeddingin
limit match_count;
end;
$$;
```

## Servidor de desarrollo
```PowerShell
yarn dev
```

## Build de produccion
Es recomendado utilizar vercel por la facilidad de hacer el deployment de produccion con bajo costo para nextjs
Crear build
```PowerShell
yarn build
```
Serve
```PowerShell
yarn start
```

