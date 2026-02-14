# Noderium App

This is the main application for Noderium, a local-first, graph-powered, and blazing fast note-taking app.

This application is built with [Tauri](https://tauri.app/), [SolidJS](https://www.solidjs.com/), and [Rust](https://www.rust-lang.org/).

## Development

This application is part of a [pnpm monorepo](https://pnpm.io/workspaces). To run this app, you should use the scripts from the root of the repository.

1.  **Navigate to the root of the repository.**
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Run the app in development mode:**
    ```bash
    pnpm app:dev
    ```

### Building the App

To build the app for production, run the following command from the root of the repository:

```bash
pnpm --filter noderium-app build
```

This will create a distributable binary in `apps/app/src-tauri/target/release/`.

## Contributing

Please see the root `README.md` and `CONTRIBUTING.md` for details on the project's architecture, roadmap, and how to contribute.
