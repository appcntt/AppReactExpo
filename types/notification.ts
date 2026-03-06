export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "system"
    | "product"
    | "news";
  isRead: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
  relatedId?: string;
  relatedType?: "product" | "news" | "system";
  createdAt: string;
  updatedAt: string;
}
