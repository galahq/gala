# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-routes.spec.mjs >> visual route coverage from route surface
- Location: tests/visual/visual-routes.spec.mjs:88:1

# Error details

```
Error: A snapshot doesn't exist at /Users/nathanpapes/projects/gala/tests/visual/__screenshots__/visual-routes.spec.mjs/root-desktop.png, writing actual.
```

```
Error: A snapshot doesn't exist at /Users/nathanpapes/projects/gala/tests/visual/__screenshots__/visual-routes.spec.mjs/root-mobile.png, writing actual.
```

```
Error: Unknown visual noise detected:
console:warning:Warning: componentWillMount has been renamed, and is not recommended for use. See https://fb.me/react-unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.

Please update the following components: BrowserRouter, Route, Router, Switch
console:warning:Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://fb.me/react-unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://fb.me/react-derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.

Please update the following components: Route, Router, Switch
console:error:Failed to load resource: the server responded with a status of 401 (Unauthorized)
console:error:Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
console:warning:[.WebGL-0x11c00522000]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
console:warning:[.WebGL-0x11c0051d200]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
console:warning:[.WebGL-0x11c0051d200]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
console:warning:[.WebGL-0x11c0051d200]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)
console:error:Failed to load resource: the server responded with a status of 404 ()
console:error:e
console:error:Failed to load resource: the server responded with a status of 401 (Unauthorized)
console:error:Failed to load resource: the server responded with a status of 401 (Unauthorized)
console:error:Failed to load resource: the server responded with a status of 401 (Unauthorized)
console:info:[webpack-dev-server] Server started: Hot Module Replacement enabled, Live Reloading disabled, Progress disabled, Overlay enabled.
console:log:[HMR] Waiting for update signal from WDS...
console:info:%cDownload the React DevTools for a better development experience: https://fb.me/react-devtools font-weight:bold
console:warning:Warning: componentWillMount has been renamed, and is not recommended for use. See https://fb.me/react-unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.

Please update the following components: BrowserRouter, Route, Router, Switch
console:warning:Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://fb.me/react-unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://fb.me/react-derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 17.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder.

Please update the following components: Route, Router, Switch
console:error:Failed to load resource: the server responded with a status of 401 (Unauthorized)
console:error:Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
console:error:Failed to load resource: the server responded with a status of 401 (Unauthorized)
console:error:Failed to load resource: the server responded with a status of 404 ()
console:error:e
response:200:http://localhost:3000/packs/js/vendors-node_modules_pnpm_react-intl_2_9_0_prop-types_15_7_2_react_16_12_0_node_modules_react-c11743.chunk.js
response:200:http://localhost:3000/packs/js/config_locales_en_yml.chunk.js
response:200:https://use.typekit.net/af/0dd853/000000000000000077359fc0/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/edbff3/00000000000000007735a37c/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:http://localhost:3000/assets/@blueprintjs/icons/lib/css/blueprint-icons-16-f4f00ce71d7e9c748cf88c42cf1502a7cb859bbd5a1492416a6339faed7eaa95.ttf?2779b2235fd2e3862e6940cadb329bde
response:401:http://localhost:3000/managerships.json
response:200:https://use.typekit.net/af/96f1bb/00000000000000007735a388/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/07893a/00000000000000007735d630/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/e7ff74/00000000000000007735d61f/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/e5fe4e/00000000000000007735a384/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/3194a9/00000000000000007735d626/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/e95ef9/00000000000000007735a378/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/97665d/00000000000000007735de18/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/c25e4c/00000000000000007735a380/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/c5d411/00000000000000007735de43/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/5df4ee/00000000000000007735aabf/30/m?features=ALL&v=4&chunks=127.260&order=0
response:200:https://use.typekit.net/af/ee0fdc/00000000000000007735de3e/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/e7105f/00000000000000007735de15/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/360812/00000000000000007735aac1/30/m?features=ALL&v=4&chunks=127.260&order=0
response:200:http://localhost:3000/packs/js/vendors-node_modules_pnpm_css-loader_6_11_0_webpack_5_106_1_node_modules_css-loader_dist_runt-e1f48e.chunk.js
response:200:http://localhost:3000/readers/sign_in.json
response:200:http://localhost:3000/packs/js/app_javascript_overview_BillboardTitle_jsx.js
response:200:http://localhost:3000/packs/js/app_javascript_overview_Billboard_jsx-app_javascript_images_pin_svg-node_modules_pnpm_charact-e38467.js
response:200:http://localhost:3000/assets/google-logo-7852f7e9e8f35093d0b1c75fb3c5d8e7d20fae2f911636c5905bd9b7f78f86d0.svg
response:200:http://localhost:3000/ahoy/visits
response:200:http://localhost:3000/packs/js/app_javascript_map_view_index_jsx.chunk.js
response:200:http://localhost:3000/packs/js/node_modules_pnpm_blueprintjs_select_4_3_1_react-dom_16_12_0_react_16_12_0__react_16_12_0_nod-71b985.chunk.js
response:200:blob:http://localhost:3000/e1e9c07c-bc61-4c7e-b627-4f85ef50a294
response:200:blob:http://localhost:3000/e1e9c07c-bc61-4c7e-b627-4f85ef50a294
response:200:blob:http://localhost:3000/e1e9c07c-bc61-4c7e-b627-4f85ef50a294
response:200:blob:http://localhost:3000/e1e9c07c-bc61-4c7e-b627-4f85ef50a294
response:200:blob:http://localhost:3000/e1e9c07c-bc61-4c7e-b627-4f85ef50a294
response:200:blob:http://localhost:3000/e1e9c07c-bc61-4c7e-b627-4f85ef50a294
response:200:http://localhost:3000/announcements.json
response:404:https://api.mapbox.com/styles/v1/cbothner/cj5l9s2dg2aps2sqfrnidiq14?access_token=[REDACTED]
response:401:http://localhost:3000/saved_reading_lists.json
response:200:http://localhost:3000/
response:200:http://localhost:3000/assets/application.debug-7c215b6ea3008ee8be8b4a38c863bb7a7d7c9492bf8eb3d42b75b253a54e5e55.css
response:200:http://localhost:3000/assets/application.debug-e4fcd940daaa75509ec17f2586b1227d30b9da47c9c3b8fa95ab6034ecde4eb7.js
response:200:https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=default,fetch,Intl,Intl.~locale.en&flags=gated
response:200:https://use.typekit.net/adn1xoi.js
response:200:http://localhost:3000/mini-profiler-resources/includes.js?v=67dd1c2571ced7fc74ae7f1813e47bdf
response:200:https://use.typekit.net/af/e7ff74/00000000000000007735d61f/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/3194a9/00000000000000007735d626/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/07893a/00000000000000007735d630/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/0dd853/000000000000000077359fc0/30/l?unicode=AAAHygAAAAdhg4V2jXrgvTqablOmIuR90xJ6f7oYX7HHszHOhbuHChMcgQn5RM8D_2_09h-EDof5QbhEgbbA63nwPrW_c-fWpSq9I3W2wnPr2mXL5hwU9XCfpfCkLYjBT4lM8H7L4ONWX3ugfaTSwXm4HDcbyteaHuCpkuHywfcZB3Qmfrf-lhmtbmdiEYP1_3wmtwTqUe-84RpPif-WvZba-nEoqF8x54v53DpQrOTj48ldu33mIr3t5_p7J-7EIbKWiAPY-6fOlmzgfKcT52EWvLAE-pP79aefMQlHioFliM5EGken-uDgxR0sm5rfhBd4WUTkH-k-gPs7g-WyugAAAb0&features=ALL&v=3
response:200:https://use.typekit.net/af/e95ef9/00000000000000007735a378/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/edbff3/00000000000000007735a37c/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/c25e4c/00000000000000007735a380/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/e5fe4e/00000000000000007735a384/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:https://use.typekit.net/af/96f1bb/00000000000000007735a388/30/l?unicode=AAAHpAAAAAf4aSeyMqCGinbOeXBPi4MZepe75Z4-5rkSB3nG1uA8xtdK_oUuX-qhniu-fUw9U4aisBBHbvtPkqHToFTFauxgMylfO_Ac-j15-Xk5Zpq-cqL-fBKIXQxE8nf3LKHiHAt87_z8qLMKcmkn2vIPEfno2XoapH6-BC_aVmR7yM4XZ0w1XfPHh_D0Uvm7dICGv8wWITgrfmLtASk0FtaWg84_aFd499r2uL5oXrwSp2Zb8k_FHr088Zf1We0z-07bGuiUulUcBQmV7GdD8XDL8c0EmtX3fG2pqlFFGKPRZawITmwMJjEa2G18XZ06WfW1qpyFOay0AAAACw&features=ALL&v=3
response:200:http://localhost:3000/packs/js/runtime.js
response:200:http://localhost:3000/assets/@blueprintjs/icons/lib/css/blueprint-icons-16-f4f00ce71d7e9c748cf88c42cf1502a7cb859bbd5a1492416a6339faed7eaa95.ttf?2779b2235fd2e3862e6940cadb329bde
response:200:https://p.typekit.net/p.gif?s=1&k=adn1xoi&ht=tk&h=localhost&f=13464.13465.13467.13471.22106.22107.22108.22109.22110.23605.23609.23612.23616.35723.35724&a=5610079&js=1.11.2&app=typekit&e=js&_=1779477721944
response:401:http://localhost:3000/enrollments.json
response:401:http://localhost:3000/profile.json
response:200:http://localhost:3000/cases/features.json
response:200:http://localhost:3000/packs/js/vendors-node_modules_pnpm_tslib_2_5_3_node_modules_tslib_tslib_es6_mjs-node_modules_pnpm_tsli-f6c3b1.js
response:200:http://localhost:3000/packs/js/vendor.js
response:200:http://localhost:3000/packs/js/vendors-node_modules_mapbox-gl_dist_mapbox-gl_css.js
response:200:http://localhost:3000/packs/js/styles.js
response:200:http://localhost:3000/packs/js/config_locales_index_js-app_javascript_shared_functions_js-app_javascript_shared_orchard_js-a-f7ade4.js
response:200:http://localhost:3000/catalog/libraries.json
response:200:http://localhost:3000/tags.json
response:200:http://localhost:3000/packs/js/controllers.js
response:200:http://localhost:3000/packs/js/onboarding.js
response:200:http://localhost:3000/packs/js/app_javascript_overview_LibraryLogo_jsx-app_javascript_shared_spotlight_MaybeSpotlight_jsx.js
response:200:http://localhost:3000/packs/js/app_javascript_images_sync_recursive_category_-_jpg_-app_javascript_catalog_shared_jsx-app_ja-4b6c17.js
response:200:http://localhost:3000/packs/js/main-menu.js
response:200:http://localhost:3000/packs/js/catalog.js
response:200:http://localhost:3000/packs/js/data_image_svg_xml_charset_utf-8_3C_xml_version_271_0_27_encoding_27utf-8_27_3E_3Csvg_version-182afb.js
response:200:http://localhost:3000/cases.json
response:200:https://use.typekit.net/af/97665d/00000000000000007735de18/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/e7105f/00000000000000007735de15/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/ee0fdc/00000000000000007735de3e/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/c5d411/00000000000000007735de43/30/m?features=ALL&v=4&chunks=255.516&order=0
response:200:https://use.typekit.net/af/5df4ee/00000000000000007735aabf/30/m?features=ALL&v=4&chunks=127.260&order=0
response:200:https://use.typekit.net/af/360812/00000000000000007735aac1/30/m?features=ALL&v=4&chunks=127.260&order=0
response:200:http://localhost:3000/packs/js/vendors-node_modules_pnpm_react-intl_2_9_0_prop-types_15_7_2_react_16_12_0_node_modules_react-c11743.chunk.js
response:200:http://localhost:3000/packs/js/config_locales_en_yml.chunk.js
response:401:http://localhost:3000/saved_reading_lists.json
response:200:http://localhost:3000/mini-profiler-resources/includes.css?v=67dd1c2571ced7fc74ae7f1813e47bdf
response:200:http://localhost:3000/announcements.json
response:200:http://localhost:3000/packs/js/app_javascript_overview_BillboardTitle_jsx.js
response:200:http://localhost:3000/packs/js/app_javascript_map_view_index_jsx.chunk.js
response:200:http://localhost:3000/packs/js/vendors-node_modules_pnpm_css-loader_6_11_0_webpack_5_106_1_node_modules_css-loader_dist_runt-e1f48e.chunk.js
response:200:http://localhost:3000/packs/js/app_javascript_overview_Billboard_jsx-app_javascript_images_pin_svg-node_modules_pnpm_charact-e38467.js
response:200:http://localhost:3000/packs/js/node_modules_pnpm_blueprintjs_select_4_3_1_react-dom_16_12_0_react_16_12_0__react_16_12_0_nod-71b985.chunk.js
response:401:http://localhost:3000/managerships.json
response:404:https://api.mapbox.com/styles/v1/cbothner/cj5l9s2dg2aps2sqfrnidiq14?access_token=[REDACTED]
response:200:blob:http://localhost:3000/d4e4ab1b-d5fb-4182-a320-26b13d0bfd74
response:200:blob:http://localhost:3000/d4e4ab1b-d5fb-4182-a320-26b13d0bfd74
response:200:blob:http://localhost:3000/d4e4ab1b-d5fb-4182-a320-26b13d0bfd74
response:200:blob:http://localhost:3000/d4e4ab1b-d5fb-4182-a320-26b13d0bfd74
response:200:blob:http://localhost:3000/d4e4ab1b-d5fb-4182-a320-26b13d0bfd74
response:200:blob:http://localhost:3000/d4e4ab1b-d5fb-4182-a320-26b13d0bfd74
response:200:http://localhost:3000/mini-profiler-resources/vendor.js?v=67dd1c2571ced7fc74ae7f1813e47bdf
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:https://use.typekit.net/af/5df4ee/00000000000000007735aabf/30/m?features=ALL&v=4&chunks=259&state=127.260&order=0
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:https://use.typekit.net/af/360812/00000000000000007735aac1/30/m?features=ALL&v=4&chunks=259&state=127.260&order=0
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:https://use.typekit.net/af/ee0fdc/00000000000000007735de3e/30/m?features=ALL&v=4&chunks=515&state=255.516&order=0
response:200:https://use.typekit.net/af/97665d/00000000000000007735de18/30/m?features=ALL&v=4&chunks=515&state=255.516&order=0
response:200:https://use.typekit.net/af/e7105f/00000000000000007735de15/30/m?features=ALL&v=4&chunks=515&state=255.516&order=0
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:https://use.typekit.net/af/c5d411/00000000000000007735de43/30/m?features=ALL&v=4&chunks=515&state=255.516&order=0
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/ahoy/visits
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/mini-profiler-resources/results
response:200:http://localhost:3000/readers/sign_in.json
response:200:http://localhost:3000/assets/google-logo-7852f7e9e8f35093d0b1c75fb3c5d8e7d20fae2f911636c5905bd9b7f78f86d0.svg
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link [ref=e4] [cursor=pointer]:
      - /url: /
      - img [ref=e5]
  - text: 
  - contentinfo [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]: © 2016 – 2026 The Regents of the University of Michigan
      - generic [ref=e18]:
        - link "Get Help" [ref=e19] [cursor=pointer]:
          - /url: https://docs.learngala.com
        - link "Open Source" [ref=e20] [cursor=pointer]:
          - /url: https://github.com/galahq/gala
        - link "v1.15.0" [ref=e21] [cursor=pointer]:
          - /url: https://github.com/galahq/gala/releases/tag/v1.15.0
```

# Test source

```ts
  105 |   return tokenInput ? (await tokenInput.getAttribute('value')) || '' : '';
  106 | }
  107 | 
  108 | export async function signInReader(page, { role = 'reader' } = {}) {
  109 |   const email = process.env[`VISUAL_${role.toUpperCase()}_EMAIL`];
  110 |   const password = process.env[`VISUAL_${role.toUpperCase()}_PASSWORD`];
  111 | 
  112 |   if (!email || !password) {
  113 |     return false;
  114 |   }
  115 | 
  116 |   await page.goto('/readers/sign_in', { waitUntil: 'domcontentloaded' });
  117 |   const token = await extractAuthToken(page);
  118 | 
  119 |   const response = await page.request.post('/readers/sign_in', {
  120 |     form: {
  121 |       'authenticity_token': token,
  122 |       'reader[email]': email,
  123 |       'reader[password]': password,
  124 |       remember_me: '1',
  125 |       commit: 'Log in',
  126 |     },
  127 |     maxRedirects: 0,
  128 |   });
  129 | 
  130 |   if (!response.ok()) {
  131 |     return false;
  132 |   }
  133 | 
  134 |   await page.goto('/', { waitUntil: 'domcontentloaded' });
  135 |   return true;
  136 | }
  137 | 
  138 | export async function ensureSignedOut(page) {
  139 |   await page.context().clearCookies();
  140 |   try {
  141 |     await page.request.get('/readers/sign_out');
  142 |   } catch {
  143 |     // Sign out is best effort in case the route changes or auth is already absent.
  144 |   }
  145 |   await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  146 | }
  147 | 
  148 | function normalizeForMatch(value) {
  149 |   return `${value}`.trim();
  150 | }
  151 | 
  152 | function matchesAllowed(value, patterns = []) {
  153 |   const normalized = normalizeForMatch(value);
  154 |   return patterns.some((pattern) => {
  155 |     if (!pattern || typeof pattern !== 'string') {
  156 |       return false;
  157 |     }
  158 | 
  159 |     try {
  160 |       return new RegExp(pattern).test(normalized);
  161 |     } catch {
  162 |       return normalized.includes(pattern);
  163 |     }
  164 |   });
  165 | }
  166 | 
  167 | export function createNoiseRegistry(routePath) {
  168 |   const allowlist = routeAllowlist(routePath);
  169 |   return {
  170 |     console: allowlist.console,
  171 |     network: allowlist.network,
  172 |     status: allowlist.status,
  173 |     unknownConsole: [],
  174 |     unknownNetwork: [],
  175 |     failingResponses: [],
  176 |   };
  177 | }
  178 | 
  179 | export function classifyConsoleMessage(message, allowlist) {
  180 |   const normalized = `${message.type()}: ${message.text()}`;
  181 |   return matchesAllowed(normalized, allowlist.console) ? 'allowed' : 'unknown';
  182 | }
  183 | 
  184 | export function classifyRequest(request, response, allowlist) {
  185 |   const status = response?.status?.() || 0;
  186 | 
  187 |   if (status >= 500 || status < 100) {
  188 |     return 'failure';
  189 |   }
  190 | 
  191 |   const normalized = `${request.method()} ${status} ${request.resourceType()} ${request.url()}`;
  192 |   const isStatusAllowed = matchesAllowed(status.toString(), allowlist.status);
  193 |   const isUrlAllowed = matchesAllowed(request.url(), allowlist.network);
  194 | 
  195 |   if (isStatusAllowed || isUrlAllowed || matchesAllowed(normalized, allowlist.network)) {
  196 |     return 'allowed';
  197 |   }
  198 | 
  199 |   return 'unknown';
  200 | }
  201 | 
  202 | export function failIfUnknownNoise(collected) {
  203 |   const errors = [...collected.unknownConsole, ...collected.unknownNetwork, ...collected.failingResponses];
  204 |   if (errors.length > 0) {
> 205 |     throw new Error(`Unknown visual noise detected:\n${errors.join('\n')}`);
      |           ^ Error: Unknown visual noise detected:
  206 |   }
  207 | }
  208 | 
```