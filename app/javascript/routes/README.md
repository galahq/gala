# Rails route modules

This directory is the JavaScript filesystem router for Rails pages.

Rails remains the HTTP router. The application layout writes route identity onto
`<body>`:

- `data-rails-controller`: Rails `controller_path`
- `data-rails-action`: Rails `action_name`
- `data-rails-layout`: logical layout name

`app/javascript/application.js` starts the router. The router loads modules with
Vite `import.meta.glob` and calls `mount(context)` for matching files.

## Page routes

Place page behavior at:

```text
app/javascript/routes/<controller_path>/<action>.jsx
```

Example:

```text
app/javascript/routes/catalog/home.jsx
```

## Layout routes

Place layout behavior at:

```text
app/javascript/routes/layouts/<layout>.jsx
```

Example:

```text
app/javascript/routes/layouts/with_header.jsx
```

## Contract

Each route module should export `mount(context)` or a default mount function.
The context includes:

- `locale`
- `loadMessages`
- `route.controllerPath`
- `route.actionName`
- `route.layoutName`

Do not add pack entries or view-level JavaScript append calls. New page behavior
is a route file, not a bundle-manifest change.
