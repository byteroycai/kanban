# Kanban Board

A simple Kanban project management board built with Next.js 14, React 18, Prisma, and SQLite. The application lets you manage tasks across multiple workflow stages, create new tasks, and drag tasks between columns with smooth persistence.

## Features

- 📋 Four default workflow columns (Backlog, In Progress, Review, Done)
- ➕ Quick creation of new tasks with optional descriptions
- 🔄 Drag-and-drop reordering across and within columns with automatic persistence
- 🗃️ SQLite database access via Prisma ORM
- 🌐 RESTful API routes powered by the Next.js App Router

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create an `.env` file with the SQLite connection string (the default path stores the database in the `prisma` directory):

   ```bash
   echo "DATABASE_URL=sqlite:./prisma/dev.db" > .env
   ```

3. **Generate the Prisma client and push the schema**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed the database with the default columns and sample tasks**

   ```bash
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
app/                # Next.js App Router pages and API routes
components/         # Client components for the board UI
lib/                # Shared utilities (Prisma client, board queries)
prisma/             # Prisma schema and seed script
public/             # Static assets
```

## Available scripts

- `npm run dev` – Start the development server
- `npm run build` – Build the production bundle
- `npm run start` – Run the production server
- `npm run lint` – Lint the project with ESLint
- `npm run prisma:migrate` – Create a development migration (alias for `prisma migrate dev`)
- `npm run prisma:generate` – Generate the Prisma client
- `npm run prisma:seed` – Execute the Prisma seed script

## Database schema

The Prisma schema defines two models:

- `Column` – Represents a workflow column with an `order` field controlling its placement.
- `Task` – Represents a work item with a `position` field that determines its order inside a column.

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full definition.

## Seeding

The seed script ensures the default workflow columns exist and inserts two example tasks into the Backlog when the database is empty. See [`prisma/seed.ts`](prisma/seed.ts).

## Notes

- Drag-and-drop interactions are powered by [`@hello-pangea/dnd`](https://github.com/hello-pangea/dnd).
- All API routes reside in `app/api` and use Prisma inside transactions to guarantee consistent ordering.
- Remember to rerun `npx prisma generate` whenever you modify the Prisma schema.
