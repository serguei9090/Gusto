/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_MODE: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
