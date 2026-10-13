import { Request } from 'express';

export function extractIpAndUserAgentAndLocation(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
  const ip = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.socket.remoteAddress;
  return {
    ip,
    userAgent: req.headers['user-agent'],
    city: req.headers['x-vercel-ip-city'] as string | undefined,
    country: req.headers['x-vercel-ip-country'] as string | undefined,
  };
}
