import type { Category } from "@partflow/core";

const RECENT_CATEGORIES_KEY = 'partflow_recent_categories';
const MAX_RECENT_CATEGORIES = 5;

export interface RecentCategory {
  id: string;
  name: string;
  icon?: string;
  lastUsed: number;
}

// 获取最近使用的分类
export function getRecentCategories(): RecentCategory[] {
  try {
    const stored = localStorage.getItem(RECENT_CATEGORIES_KEY);
    if (!stored) return [];
    
    const categories: RecentCategory[] = JSON.parse(stored);
    // 按最后使用时间排序
    return categories.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('获取最近使用分类失败:', error);
    return [];
  }
}

// 添加分类到最近使用
export function addRecentCategory(category: Category): void {
  try {
    const recent = getRecentCategories();
    const now = Date.now();
    
    // 检查是否已存在
    const existingIndex = recent.findIndex(item => item.id === category.id);
    
    if (existingIndex >= 0) {
      // 更新现有项的时间
      recent[existingIndex].lastUsed = now;
    } else {
      // 添加新项
      recent.unshift({
        id: category.id,
        name: category.name,
        icon: category.icon,
        lastUsed: now
      });
    }
    
    // 限制数量
    const limitedRecent = recent
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, MAX_RECENT_CATEGORIES);
    
    localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(limitedRecent));
  } catch (error) {
    console.error('保存最近使用分类失败:', error);
  }
}

// 清除最近使用的分类
export function clearRecentCategories(): void {
  try {
    localStorage.removeItem(RECENT_CATEGORIES_KEY);
  } catch (error) {
    console.error('清除最近使用分类失败:', error);
  }
}

// 构建包含最近使用的分类选项
export function buildCategoryOptionsWithRecent(
  allCategories: Category[], 
  recentCategories: RecentCategory[]
): Array<{ id: string; label: string; level: number }> {
  const result: Array<{ id: string; label: string; level: number }> = [];
  
  // 添加最近使用的分类（如果有）
  if (recentCategories.length > 0) {
    result.push({
      id: 'recent-header',
      label: '最近使用',
      level: 0
    });
    
    recentCategories.forEach(recent => {
      const category = allCategories.find(cat => cat.id === recent.id);
      if (category) {
        // 只显示 emoji 图标，不显示图片 URL 或 base64 数据
        const displayIcon = category.icon && 
          !category.icon.startsWith('http') && 
          !category.icon.startsWith('data:') && 
          !category.icon.startsWith('/') 
          ? category.icon + ' ' 
          : '';
        
        result.push({
          id: `recent-${category.id}`,  // 添加前缀避免重复 key
          label: `　${displayIcon}${category.name}`,
          level: 1
        });
      }
    });
    
    // 添加分隔线
    result.push({
      id: 'separator',
      label: '────────────',
      level: 0
    });
  }
  
  // 添加所有分类的层级结构
  const buildTree = (parentId: string | undefined, level: number, prefix: string) => {
    const children = allCategories.filter(cat => cat.parentId === parentId);
    children.forEach(cat => {
      // 只显示 emoji 图标，不显示图片 URL 或 base64 数据
      const displayIcon = cat.icon && 
        !cat.icon.startsWith('http') && 
        !cat.icon.startsWith('data:') && 
        !cat.icon.startsWith('/') 
        ? cat.icon + ' ' 
        : '';
      
      result.push({
        id: cat.id,
        label: `${prefix}${displayIcon}${cat.name}`,
        level
      });
      
      // 递归处理子分类
      buildTree(cat.id, level + 1, prefix + '　');
    });
  };
  
  // 从顶级分类开始
  buildTree(undefined, 0, '');
  
  return result;
}
