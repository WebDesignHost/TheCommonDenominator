// Utility for managing anonymous client ID
export function getClientId(): string {
  if (typeof window === 'undefined') return '';

  let clientId = localStorage.getItem('blog_client_id');

  if (!clientId) {
    // Generate a unique client ID
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('blog_client_id', clientId);
  }

  return clientId;
}
