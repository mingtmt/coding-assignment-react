import ky from 'ky';

export const http = ky.create({
  prefixUrl: '/api',
  hooks: {
    beforeRequest: [
      req => {
        req.headers.set('Content-Type', 'application/json');
      }
    ]
  }
});