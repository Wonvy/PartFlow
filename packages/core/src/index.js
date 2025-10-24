export function createPart(input) {
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
export function createCategory(input) {
    const now = new Date().toISOString();
    return {
        id: input.id ?? cryptoRandomId(),
        name: input.name,
        parentId: input.parentId,
        icon: input.icon,
        description: input.description,
        createdAt: now,
        updatedAt: now
    };
}
export function createLocation(input) {
    const now = new Date().toISOString();
    return {
        id: input.id ?? cryptoRandomId(),
        code: input.code.toUpperCase(), // 自动转大写
        name: input.name,
        description: input.description,
        createdAt: now,
        updatedAt: now
    };
}
export function createInventoryChange(input) {
    const changeType = input.delta > 0 ? "in" : "out";
    const quantity = Math.abs(input.delta);
    return {
        id: input.id ?? cryptoRandomId(),
        partId: input.partId,
        delta: input.delta,
        changeType,
        quantity,
        reason: input.reason,
        operator: input.operator,
        timestamp: new Date().toISOString()
    };
}
export function createTag(input) {
    return {
        id: input.id ?? cryptoRandomId(),
        name: input.name,
        color: input.color,
        createdAt: new Date().toISOString()
    };
}
export function applyInventoryChange(part, change) {
    const nextQuantity = part.quantity + change.delta;
    return {
        ...part,
        quantity: nextQuantity < 0 ? 0 : nextQuantity,
        updatedAt: change.timestamp
    };
}
export function isLowStock(part) {
    if (part.minQuantity === undefined)
        return false;
    return part.quantity <= part.minQuantity;
}
export function buildCategoryPath(categories, categoryId) {
    const result = [];
    let current = categories.find((c) => c.id === categoryId);
    while (current) {
        result.unshift(current.name);
        if (!current.parentId)
            break;
        current = categories.find((c) => c.id === current.parentId);
    }
    return result;
}
export function cryptoRandomId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        // @ts-ignore
        return crypto.randomUUID();
    }
    return `pf_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
