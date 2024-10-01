declare global {
  const process: NodeJS.Process;
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_URL: string;
      readonly BASE_URL: string;
      readonly APP_NAME: string;
      readonly APP_SOCKET_URL: string;
      readonly APP_FILE_URL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};