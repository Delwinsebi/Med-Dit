# Med-Dit

#### Video Demo: <VIDEO_DEMO_URL_HERE>

#### Description:

Med-Dit is a Reddit-inspired discussion platform for medical students, trainees, and healthcare professionals. It is designed as a calmer place to ask questions, share study experiences, discuss clinical topics, and exchange useful resources with people who understand the vocabulary and context of medicine. The application focuses on a simple feed and a small set of purposeful workflows instead of trying to reproduce every feature of a large social network.

The home page is the public discussion feed. Posts are loaded from Supabase in reverse chronological order and presented with their topic, content, author, community label, relative publication time, like count, and comment count. The interface is responsive, so the feed remains usable on a phone as well as a wider desktop display. The search field, like control, comment control, and share control establish the intended interaction model for the community, although their backend behavior is still future work.

Users can open the profile page to create an account or sign in with an existing Supabase Auth account. After signing in, they can edit their display name and short biography, sign out, and review the posts associated with their username. Creating a post is intentionally restricted to authenticated users. The route guard redirects visitors who are not signed in to the profile page, and the submit form validates the topic and content before inserting a new row into Supabase. Once publishing succeeds, the user is returned to the home feed.

## Technology and Setup

The frontend is built with Vue 3 and TypeScript and is served during development by Vite. Vue Router owns navigation, while Pinia provides the shared post store used by the home, submit, and profile views. Supabase supplies authentication and the database API through `@supabase/supabase-js`. The project also includes Tailwind/PostCSS configuration, although the current visual system is primarily expressed in the application stylesheet. Axios and VueUse are available dependencies for future integrations.

To run the project locally, install Node.js and then run:

```bash
npm install
npm run dev
```

The Supabase client in `src/utils/supabase.ts` reads the project URL and public client key from Vite environment variables. A local environment file must provide the values expected by that module before database-backed features can work. The database should expose a `posts` table with fields including `id`, `topic`, `content`, `user_name`, and `created_at`. The profile workflow expects a `users` table keyed by the authenticated user id, with `user_name`, `display_name`, and `bio` fields. Supabase Auth must also be enabled for email/password sign-in and account creation.

## Important Files

- `index.html` is the Vite HTML entry point.
- `src/main.ts` creates the Vue application, installs Pinia and Vue Router, and loads the global stylesheet.
- `src/App.vue` contains the shared top navigation, authentication session listener, profile avatar initial, and persisted light/dark theme switch. It also contains an older `todos` query that is retained from the initial Supabase setup and is not part of the main Med-Dit workflow.
- `src/router/index.ts` defines the home, submit, and profile routes. Its `beforeEnter` guard prevents unauthenticated users from opening the submit view.
- `src/views/Home.vue` composes the feed layout, community introduction, search presentation, toolbar, and post list.
- `src/views/Submit.vue` owns post creation, including trimming and validating form values, checking the current session, finding the user’s username, reporting Supabase errors, and redirecting after a successful insert.
- `src/views/Profile.vue` owns sign-in, sign-up, profile loading, profile updates, authored-post loading, and sign-out. It keeps authentication state synchronized with Supabase’s auth-state listener.
- `src/components/Post.vue` is the reusable post-card presentation component. It receives a typed post object rather than querying the database itself.
- `src/stores/posts.ts` is the central post data layer. It fetches the feed, fetches posts by username, maps database rows into the UI model, formats relative timestamps, and inserts new posts.
- `src/utils/supabase.ts` creates the single Supabase client used throughout the application.
- `src/style.css` defines the color tokens, typography, layout, responsive rules, cards, buttons, form controls, and light/dark theme appearance.
- `supabase/migrations/` is reserved for versioned database schema changes. The current repository does not yet include a committed migration, so the deployed Supabase schema must be configured separately.
- `Dockerfile` and `nginx.conf` support serving the built Vite application from an Nginx container.

## Design Decisions and Scope

The project uses a centralized Pinia store rather than putting database calls directly into every component. This keeps row mapping and timestamp formatting consistent and makes it easier to add caching, pagination, or real-time subscriptions later. Supabase Auth was chosen because it provides session management without requiring a separate authentication server, while the public `users` table gives the application a stable place for profile information that is useful to posts.

The visual design deliberately uses a restrained editorial layout: a narrow reading column, generous spacing, clear form hierarchy, and an optional dark theme. This supports scanning and long-form discussion better than a dashboard crowded with controls. The app currently prioritizes the complete browse, account, profile, and publish paths. Likes, comments, search, moderation, specialty tags, and richer community navigation are visible future extensions rather than falsely simulated functionality.

## Available Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create the production build
npm run preview   # Serve the production build locally
docker build -t med-dit:latest .
```

No license has been specified for the project yet.


