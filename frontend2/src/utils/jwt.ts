export function isJwtExpired(token: string): boolean {
     try {
          const [, payload] = token.split('.');
          const decoded = JSON.parse(atob(payload));
          const now = Math.floor(Date.now() / 1000);
          return decoded.exp && decoded.exp < now;
     } catch {
          return true;
     }
}