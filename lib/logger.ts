// lib/logger.ts

export const log = {
    error: (message: string, error?: any) => {
      console.error(message, error);
      // This will appear in Vercel logs
      console.log(JSON.stringify({ level: 'error', message, error }));
    },
    info: (message: string, data?: any) => {
      console.info(message, data);
      // This will appear in Vercel logs
      console.log(JSON.stringify({ level: 'info', message, data }));
    }
  };