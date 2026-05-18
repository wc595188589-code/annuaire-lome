const API = '/api';

// 👇 在这里设置你的 WhatsApp 收款号码（多哥号码）
export const SUPPORT_WHATSAPP = "22872155051";

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = localStorage.getItem('adminToken');
  if (token) headers['x-admin-token'] = token;

  const res = await fetch(`${API}${url}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  health: () => request('/health'),
  settings: () => request('/settings'),
  categories: () => request('/categories'),
  listings: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/listings${q ? `?${q}` : ''}`);
  },
  listing: (id) => request(`/listings/${id}`),
  ads: () => request('/ads'),
  register: (body) => request('/listings', { method: 'POST', body: JSON.stringify(body) }),
  requestPin: (body) => request('/payments/pin', { method: 'POST', body: JSON.stringify(body) }),
  requestAd: (body) => request('/payments/ad', { method: 'POST', body: JSON.stringify(body) }),

  adminLogin: (password) =>
    request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  adminStats: () => request('/admin/stats'),
  adminListings: (status) => request(`/admin/listings${status ? `?status=${status}` : ''}`),
  adminPatchListing: (id, body) =>
    request(`/admin/listings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminDeleteListing: (id) => request(`/admin/listings/${id}`, { method: 'DELETE' }),
  adminPayments: () => request('/admin/payments'),
  adminPatchPayment: (id, body) =>
    request(`/admin/payments/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminAds: () => request('/admin/ads'),
  adminCreateAd: (body) => request('/admin/ads', { method: 'POST', body: JSON.stringify(body) }),
  adminPatchAd: (id, body) =>
    request(`/admin/ads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  adminDeleteAd: (id) => request('/admin/ads/${id}', { method: 'DELETE' }),
};

export function whatsappLink(number, text = '') {
  const digits = String(number).replace(/\D/g, '');
  const msg = encodeURIComponent(text);
  return `https://wa.me/${digits}${msg ? `?text=${msg}` : ''}`;
}