
export function getUsernameFromToken(token: string): string | null {
     try {
          const payloadBase64Url = token.split('.')[1];
          if (!payloadBase64Url) return null;

          const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');

          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);

          return payload.username ?? null;
     } catch {
          return null;
     }
}

export function getIdFromToken(token: string): number | null {
     try {
          const payloadBase64Url = token.split('.')[1];
          if (!payloadBase64Url) return null;

          const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');

          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);

          return Number(payload.id) ?? null;
     } catch {
          return null;
     }
}

