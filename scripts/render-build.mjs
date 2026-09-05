import { execFileSync } from 'node:child_process';
const api = process.env.VITE_API_BASE_URL;
if (!api || !/^https:\/\/[^/]+\/api\/v1\/?$/.test(api)) throw new Error('Configure VITE_API_BASE_URL as an explicit HTTPS API URL ending in /api/v1.');
if (!process.env.VITE_HCAPTCHA_SITEKEY || process.env.VITE_HCAPTCHA_SITEKEY === '10000000-ffff-ffff-ffff-000000000001') throw new Error('Configure a real hCaptcha site key.');
execFileSync('npm', ['ci'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
