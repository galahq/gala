import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import yaml from '@rollup/plugin-yaml';
import { defineConfig, transformWithOxc } from 'vite';

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));
const javascriptRoot = path.join(root, 'app/javascript');
const buildsRoot = path.join(root, 'app/assets/builds');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const packageNames = new Set([
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.devDependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
  ...Object.keys(packageJson.optionalDependencies || {}),
]);
const nodeEnv = process.env.NODE_ENV || (process.env.RAILS_ENV === 'production' ? 'production' : 'development');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function javascriptFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...javascriptFiles(fullPath));
      continue;
    }

    if (entry.isFile()) files.push(fullPath);
  }

  return files;
}

function javascriptAliases() {
  const directoryAliases = fs.readdirSync(javascriptRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const replacement = path.join(javascriptRoot, entry.name);
      const aliases = [
        {
          find: new RegExp(`^${escapeRegExp(entry.name)}/`),
          replacement: `${replacement}/`,
        },
      ];

      if (!packageNames.has(entry.name)) {
        aliases.push({ find: entry.name, replacement });
      }

      return aliases;
    });

  const fileAliases = fs.readdirSync(javascriptRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => ['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(entry.name)))
    .map((entry) => {
      const aliasName = path.basename(entry.name, path.extname(entry.name));
      if (packageNames.has(aliasName)) return null;

      return { find: aliasName, replacement: path.join(javascriptRoot, entry.name) };
    })
    .filter(Boolean);

  return [...directoryAliases, ...fileAliases];
}

const cssBundlingOutputs = new Set(['application.css', 'print.css']);
const cssBundlingDigests = [/^application-[\w-]+\.digested\.css$/, /^print-[\w-]+\.digested\.css$/];

function isCssBundlingOutput(fileName) {
  return cssBundlingOutputs.has(fileName) || cssBundlingDigests.some((pattern) => pattern.test(fileName));
}

function pruneStaleJavascriptBuilds(currentBuildFiles) {
  if (!fs.existsSync(buildsRoot)) return;

  for (const entry of fs.readdirSync(buildsRoot, { withFileTypes: true })) {
    if (entry.name === '.keep') continue;
    if (currentBuildFiles.has(entry.name)) continue;
    if (isCssBundlingOutput(entry.name)) continue;

    fs.rmSync(path.join(buildsRoot, entry.name), { force: true, recursive: true });
  }
}

function cleanJavascriptBuilds() {
  let currentBuildFiles = new Set();

  return {
    name: 'gala-clean-javascript-builds',
    generateBundle(_options, bundle) {
      currentBuildFiles = new Set(Object.keys(bundle));
    },
    closeBundle() {
      pruneStaleJavascriptBuilds(currentBuildFiles);
    },
  };
}

function appJavascriptWatchBoundary() {
  return {
    name: 'gala-app-javascript-watch-boundary',
    buildStart() {
      this.addWatchFile(javascriptRoot);

      for (const file of javascriptFiles(javascriptRoot)) {
        this.addWatchFile(file);
      }
    },
  };
}

function developmentLiveReload() {
  const appPort = process.env.APP_HOST_PORT || process.env.PORT || '3000';
  const liveReloadUrl = process.env.GALA_LIVE_RELOAD_URL || `http://localhost:${appPort}/hmrd`;
  const liveReloadEnabled = process.env.GALA_LIVE_RELOAD !== '0';
  let initialBuildComplete = false;

  return {
    name: 'gala-development-live-reload',
    async closeBundle() {
      if (!this.meta.watchMode) return;
      if (nodeEnv !== 'development') return;
      if (!liveReloadEnabled) return;

      if (!initialBuildComplete) {
        initialBuildComplete = true;
        return;
      }

      try {
        const response = await fetch(liveReloadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'vite',
            path: 'app/javascript',
          }),
        });

        if (!response.ok) {
          this.warn(`live reload notify returned HTTP ${response.status}`);
        }
      } catch (error) {
        this.warn(`live reload notify failed: ${error.message}`);
      }
    },
  };
}

function rawSvgAsString() {
  return {
    name: 'gala-raw-svg-as-string',
    enforce: 'pre',
    load(id) {
      if (!id.endsWith('.svg')) return null;

      return {
        code: `export default ${JSON.stringify(fs.readFileSync(id, 'utf8'))};`,
        map: null,
      };
    },
  };
}

function objectInspectBrowserShim() {
  const inspectShimPath = path.join(javascriptRoot, 'shims/objectInspect.js');
  const shimPath = path.join(javascriptRoot, 'shims/objectInspectUtil.js');
  const objectInspectUtilPath = require.resolve('object-inspect/util.inspect.js');

  return {
    name: 'gala-object-inspect-browser-shim',
    resolveId(source, importer) {
      if (
        source === 'object-inspect' ||
        source === 'object-inspect/util.inspect' ||
        source === 'object-inspect/util.inspect.js' ||
        source === objectInspectUtilPath ||
        (source === './util.inspect' && importer?.includes('/object-inspect/'))
      ) {
        if (source === 'object-inspect') return inspectShimPath;

        return shimPath;
      }

      return null;
    },
  };
}

function appJsxInJs() {
  return {
    name: 'gala-app-jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.startsWith(javascriptRoot) || !id.endsWith('.js')) return null;
      if (!code.includes('<')) return null;

      return transformWithOxc(code, id, {
        lang: 'jsx',
        jsx: {
          runtime: 'classic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
        },
      });
    },
  };
}

export default defineConfig({
  root,
  base: './',
  publicDir: false,
  cacheDir: 'tmp/vite',
  plugins: [cleanJavascriptBuilds(), appJavascriptWatchBoundary(), developmentLiveReload(), objectInspectBrowserShim(), appJsxInJs(), rawSvgAsString(), yaml()],
  define: {
    __GALA_NODE_ENV__: JSON.stringify(nodeEnv),
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(nodeEnv),
  },
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.scss', '.css'],
    alias: [
      ...javascriptAliases(),
      { find: /^object-inspect$/, replacement: path.join(javascriptRoot, 'shims/objectInspect.js') },
      { find: 'path', replacement: require.resolve('path-browserify') },
      { find: 'process', replacement: path.join(javascriptRoot, 'shims/process.js') },
    ],
  },
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: 'jsdom',
    exclude: ['vendor/**', 'node_modules/**'],
    globals: true,
    include: ['app/javascript/**/*.{test,spec}.{js,jsx}'],
    setupFiles: ['spec/support/vitest-setup.js'],
  },
  build: {
    outDir: buildsRoot,
    emptyOutDir: false,
    copyPublicDir: false,
    cssCodeSplit: true,
    cssMinify: nodeEnv === 'production',
    manifest: false,
    minify: nodeEnv === 'production' ? 'esbuild' : false,
    modulePreload: false,
    reportCompressedSize: false,
    sourcemap: nodeEnv === 'production',
    target: 'esnext',
    rollupOptions: {
      input: {
        application: path.join(javascriptRoot, 'application.js'),
      },
      output: {
        assetFileNames(assetInfo) {
          const name = assetInfo.names?.[0] || assetInfo.name || '[name]';
          const extension = path.extname(name);

          if (extension === '.css') return 'javascript-[name]-[hash].digested[extname]';

          return '[name]-[hash].digested[extname]';
        },
        chunkFileNames: '[name]-[hash].digested.js',
        entryFileNames: '[name]-[hash].digested.js',
      },
    },
  },
});
