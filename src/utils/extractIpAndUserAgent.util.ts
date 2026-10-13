import { Request } from 'express';

export function extractIpAndUserAgentAndLocation(req: Request) {
  return {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    city: req.headers['x-vercel-ip-city'] as string | undefined,
    country: req.headers['x-vercel-ip-country'] as string | undefined,
  };
}
