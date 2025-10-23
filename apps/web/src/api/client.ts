import type { Part, Category, Location } from "@partflow/core";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Parts
  getParts: (params?: { search?: string; categoryId?: string; locationId?: string; lowStock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.categoryId) query.set("categoryId", params.categoryId);
    if (params?.locationId) query.set("locationId", params.locationId);
    if (params?.lowStock) query.set("lowStock", "true");
    
    return fetchAPI<{ data: Part[]; total: number }>(`/parts?${query}`);
  },

  getPart: (id: string) => fetchAPI<{ data: Part }>(`/parts/${id}`),

  createPart: (part: Partial<Part>) =>
    fetchAPI<{ data: Part }>("/parts", {
      method: "POST",
      body: JSON.stringify(part)
    }),

  updatePart: (id: string, part: Partial<Part>) =>
    fetchAPI<{ data: Part }>(`/parts/${id}`, {
      method: "PUT",
      body: JSON.stringify(part)
    }),

  deletePart: (id: string) =>
    fetchAPI<void>(`/parts/${id}`, {
      method: "DELETE"
    }),

  updateInventory: (id: string, delta: number, reason?: string) =>
    fetchAPI<{ data: Part }>(`/parts/${id}/inventory`, {
      method: "POST",
      body: JSON.stringify({ delta, reason })
    }),

  // Categories
  getCategories: () => fetchAPI<{ data: Category[]; total: number }>("/categories"),

  createCategory: (category: Partial<Category>) =>
    fetchAPI<{ data: Category }>("/categories", {
      method: "POST",
      body: JSON.stringify(category)
    }),

  updateCategory: (id: string, category: Partial<Category>) =>
    fetchAPI<{ data: Category }>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(category)
    }),

  deleteCategory: (id: string) =>
    fetchAPI<void>(`/categories/${id}`, {
      method: "DELETE"
    }),

  // Locations
  getLocations: () => fetchAPI<{ data: Location[]; total: number }>("/locations"),

  createLocation: (location: Partial<Location>) =>
    fetchAPI<{ data: Location }>("/locations", {
      method: "POST",
      body: JSON.stringify(location)
    }),

  updateLocation: (id: string, location: Partial<Location>) =>
    fetchAPI<{ data: Location }>(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(location)
    }),

  deleteLocation: (id: string) =>
    fetchAPI<void>(`/locations/${id}`, {
      method: "DELETE"
    })
};

