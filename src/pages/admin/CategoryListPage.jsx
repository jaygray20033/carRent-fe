// src/pages/admin/CategoryListPage.jsx
// Admin post-category manager (UC-56).
import TaxonomyManager from './TaxonomyManager.jsx';
import { adminCategoryService } from '../../services/adminService.js';

export default function CategoryListPage() {
  return (
    <TaxonomyManager
      title="Danh mục bài viết"
      service={adminCategoryService}
      queryKey="adminCategories"
      itemNoun="danh mục"
    />
  );
}
