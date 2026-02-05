# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: "[plugin:vite:import-analysis] Failed to resolve import \"@radix-ui/react-tabs\" from \"src/components/ui/tabs.tsx\". Does the file exist?"
  - generic [ref=e5]: I:/01-Master_Code/Apps/RestaurantManage/src/components/ui/tabs.tsx:3:31
  - generic [ref=e6]: "16 | } 17 | \"use client\"; 18 | import * as TabsPrimitive from \"@radix-ui/react-tabs\"; | ^ 19 | import * as React from \"react\"; 20 | import { cn } from \"@/lib/utils\";"
  - generic [ref=e7]: at TransformPluginContext._formatLog (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:42528:41) at TransformPluginContext.error (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:42525:16) at normalizeUrl (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:40504:23) at process.processTicksAndRejections (node:internal/process/task_queues:105:5) at async file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:40623:37 at async Promise.all (index 3) at async TransformPluginContext.transform (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:40550:7) at async EnvironmentPluginContainer.transform (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:42323:18) at async loadAndTransform (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:35739:27) at async viteTransformMiddleware (file:///I:/01-Master_Code/Apps/RestaurantManage/node_modules/vite/dist/node/chunks/dep-D4NMHUTW.js:37254:24
  - generic [ref=e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.
    - text: You can also disable this overlay by setting
    - code [ref=e9]: server.hmr.overlay
    - text: to
    - code [ref=e10]: "false"
    - text: in
    - code [ref=e11]: vite.config.ts
    - text: .
```