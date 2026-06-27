/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
