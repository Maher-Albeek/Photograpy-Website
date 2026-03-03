export {}

declare global {
  interface Window {
    trustedTypes?: {
      defaultPolicy?: unknown
      createPolicy: (
        name: string,
        rules: {
          createHTML?: (input: string) => string
          createScript?: (input: string) => string
          createScriptURL?: (input: string) => string
        }
      ) => unknown
    }
  }
}
