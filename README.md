This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Base de datos y migraciones Supabase

La estructura de base de datos del proyecto se gestiona desde Git con Supabase CLI. Los cambios de schema deben quedar en `supabase/migrations/` y no hacerse manualmente desde el panel de Supabase.

Los comandos siguientes asumen Supabase CLI instalado y una sesion iniciada con `supabase login`. Si no tienes el CLI instalado globalmente, puedes ejecutar el mismo comando con `npm exec --yes --package supabase -- supabase <comando>`.

### Crear una nueva migracion

```bash
supabase migration new nombre_descriptivo_de_la_migracion
```

El CLI genera un archivo con timestamp oficial en `supabase/migrations/`. Edita ese archivo SQL con los cambios de schema que correspondan.

### Aplicar migraciones

Para aplicar migraciones al proyecto remoto vinculado:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Tambien puedes aplicar migraciones a una base especifica usando una URL de conexion:

```bash
supabase db push --db-url "<postgres-connection-url>"
```

Para validar contra la base local de Supabase:

```bash
supabase start
supabase db push --local
```

### Replicar la base en otro entorno

1. Clona el repositorio y configura Supabase CLI.
2. Vincula el proyecto destino con `supabase link --project-ref <project-ref>` o usa `--db-url`.
3. Ejecuta `supabase db push` para aplicar todas las migraciones pendientes.

Si el entorno debe partir desde cero, crea primero el proyecto/base de datos destino y despues aplica las migraciones versionadas desde este repositorio.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
