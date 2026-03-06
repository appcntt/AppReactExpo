export interface ThuVien {
  id: string;
  title: string;
  videoId: string;
  categoryThuVien?: {
    id: string;
    name: string;
  };
  isActive?: boolean;
  isMoi?: boolean;
  createdAt: string;
}
