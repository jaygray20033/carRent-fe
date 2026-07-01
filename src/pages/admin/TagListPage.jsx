// src/pages/admin/TagListPage.jsx
// Admin tag manager (UC-56).
import TaxonomyManager from './TaxonomyManager.jsx';
import { adminTagService } from '../../services/adminService.js';

export default function TagListPage() {
  return (
    <TaxonomyManager
      title="Thẻ bài viết"
      service={adminTagService}
      queryKey="adminTags"
      itemNoun="thẻ"
    />
  );
}
