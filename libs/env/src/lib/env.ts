import { exit } from 'process';

export function env(key: string): string {
  if (!process.env[key]) {
    console.error(
      `Missing environment variable "${key}". Try adding a .env file or check your current shell environment`
    );
    exit(1);
  } else {
    return process.env[key];
  }
}
