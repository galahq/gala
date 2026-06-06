const routeModules = import.meta.glob('../routes/**/*.{js,jsx}')

function routeModulePaths (routePath) {
  return [
    `../routes/${routePath}.js`,
    `../routes/${routePath}.jsx`,
    `../routes/${routePath}/index.js`,
    `../routes/${routePath}/index.jsx`,
  ]
}

async function mountRouteModule (routePath, context) {
  for (const modulePath of routeModulePaths(routePath)) {
    const loader = routeModules[modulePath]
    if (!loader) continue

    const routeModule = await loader()
    const mount = routeModule.mount || routeModule.default

    if (typeof mount === 'function') {
      await mount(context)
    }

    return true
  }

  return false
}

function routeContextFromDocument () {
  const body = document.body

  return {
    controllerPath: body?.dataset.railsController || '',
    actionName: body?.dataset.railsAction || '',
    layoutName: body?.dataset.railsLayout || 'application',
  }
}

function candidateRoutePaths ({ controllerPath, actionName, layoutName }) {
  return [
    `layouts/${layoutName}`,
    `${controllerPath}/${actionName}`,
  ].filter((routePath) => !routePath.includes('//') && !routePath.endsWith('/'))
}

export async function startRailsRouteRouter (context = {}) {
  const routeContext = routeContextFromDocument()
  const paths = candidateRoutePaths(routeContext)

  for (const routePath of paths) {
    await mountRouteModule(routePath, { ...context, route: routeContext })
  }
}
