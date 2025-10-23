export type Part = {
  id: string;
  name: string;
  specification?: string;
  material?: string;
  tags?: string[];
  categoryId?: string;
  locationId?: string;
  quantity: number;
  minQuantity?: number; // 预警阈值
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  createdAt: string;
};

export type Location = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type InventoryChange = {
  id: string;
  partId: string;
  delta: number; // positive for in, negative for out
  reason?: string;
  operator?: string;
  createdAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
};

export function createPart(input: Omit<Part, "id" | "createdAt" | "updatedAt"> & { id?: string }): Part {
  const now = new Date().toISOString();
  return {
    id: input.id ?? cryptoRandomId(),
    name: input.name,
    specification: input.specification,
    material: input.material,
    tags: input.tags ?? [],
    categoryId: input.categoryId,
    locationId: input.locationId,
    quantity: input.quantity ?? 0,
    minQuantity: input.minQuantity,
    imageUrl: input.imageUrl,
    createdAt: now,
    updatedAt: now
  };
}

export function createCategory(input: Omit<Category, "id" | "createdAt"> & { id?: string }): Category {
  return {
    id: input.id ?? cryptoRandomId(),
    name: input.name,
    parentId: input.parentId,
    description: input.description,
    createdAt: new Date().toISOString()
  };
}

export function createLocation(input: Omit<Location, "id" | "createdAt"> & { id?: string }): Location {
  return {
    id: input.id ?? cryptoRandomId(),
    name: input.name,
    description: input.description,
    createdAt: new Date().toISOString()
  };
}

export function createInventoryChange(
  input: Omit<InventoryChange, "id" | "createdAt"> & { id?: string }
): InventoryChange {
  return {
    id: input.id ?? cryptoRandomId(),
    partId: input.partId,
    delta: input.delta,
    reason: input.reason,
    operator: input.operator,
    createdAt: new Date().toISOString()
  };
}

export function createTag(input: Omit<Tag, "id" | "createdAt"> & { id?: string }): Tag {
  return {
    id: input.id ?? cryptoRandomId(),
    name: input.name,
    color: input.color,
    createdAt: new Date().toISOString()
  };
}

export function applyInventoryChange(part: Part, change: InventoryChange): Part {
  const nextQuantity = part.quantity + change.delta;
  return {
    ...part,
    quantity: nextQuantity < 0 ? 0 : nextQuantity,
    updatedAt: change.createdAt
  };
}

export function isLowStock(part: Part): boolean {
  if (part.minQuantity === undefined) return false;
  return part.quantity <= part.minQuantity;
}

export function buildCategoryPath(categories: Category[], categoryId: string): string[] {
  const result: string[] = [];
  let current = categories.find((c) => c.id === categoryId);
  
  while (current) {
    result.unshift(current.name);
    if (!current.parentId) break;
    current = categories.find((c) => c.id === current!.parentId);
  }
  
  return result;
}

export function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return `pf_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

