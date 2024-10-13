import { createConsola } from "consola";

// 0: Fatal and Error
// 1: Warnings
// 2: Normal logs
// 3: Informational logs, success, fail, ready, start, ...
// 4: Debug logs
// 5: Trace logs
// -999: Silent
// +999: Verbose logs
export const createLog = (tag: string) => {
  return createConsola({
    level: 3,
    formatOptions: {
      colors: true,
      date: true,
      columns: 200,
      compact: true,
    },
  }).withTag(tag);
};
