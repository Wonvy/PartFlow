/**
 * 修复分类名称中包含 base64 图片数据的问题
 * 
 * 问题：分类的 name 字段被错误地设置为 icon 的 base64 数据
 * 解决：将 base64 数据移到 icon 字段，恢复正确的 name
 */

import { CategoriesDAO } from '../packages/server/src/db/dao/categories.js';

async function fixCategoryNames() {
  try {
    // 获取所有分类
    const categories = CategoriesDAO.findAll();
    
    console.log(`\n找到 ${categories.length} 个分类，开始检查...\n`);
    
    let fixedCount = 0;
    
    for (const category of categories) {
      // 检查 name 是否包含 base64 数据
      if (category.name && category.name.includes('data:image/')) {
        console.log(`❌ 发现错误数据：`);
        console.log(`   ID: ${category.id}`);
        console.log(`   错误的 name: ${category.name.length > 80 ? category.name.substring(0, 80) + '...' : category.name}`);
        
        // 尝试从名称中提取真实的名称
        // 如果名称是 "data:image/png;base64,iVBORw0KGgoAAAA...打印机"
        // 我们需要提取 "打印机" 部分
        let realName = '';
        let iconData = '';
        
        // 查找 base64 数据后的文字
        const base64Regex = /^(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\s*(.*)$/;
        const match = category.name.match(base64Regex);
        
        if (match) {
          iconData = match[1]; // base64 数据
          realName = match[2].trim(); // 后面的文字
          
          if (!realName) {
            console.log(`   ⚠️  无法提取名称，跳过此分类（ID: ${category.id}）`);
            console.log(`   请手动在界面中修复此分类\n`);
            continue;
          }
          
          // 更新分类
          CategoriesDAO.update(category.id, {
            name: realName,
            icon: iconData,
            description: category.description,
            parentId: category.parentId
          });
          
          console.log(`   ✅ 已修复：`);
          console.log(`      新 name: ${realName}`);
          console.log(`      新 icon: [图片数据 ${iconData.length} 字符]`);
          console.log('');
          
          fixedCount++;
        } else {
          console.log(`   ⚠️  格式不匹配，跳过此分类\n`);
        }
      }
    }
    
    console.log(`\n✅ 修复完成！共修复 ${fixedCount} 个分类\n`);
    
    // 显示所有分类的名称
    console.log('当前所有分类：');
    const allCategories = CategoriesDAO.findAll();
    allCategories
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(cat => {
        const iconDisplay = cat.icon 
          ? (cat.icon.startsWith('data:') ? '[图片]' : cat.icon)
          : '[无]';
        console.log(`  - ${cat.name} (图标: ${iconDisplay})`);
      });
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  }
}

// 运行修复
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           修复分类名称中的 Base64 数据问题                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝');

fixCategoryNames().catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
