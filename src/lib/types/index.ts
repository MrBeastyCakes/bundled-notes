export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserSettings {
  theme: "light" | "dark";
  defaultBundleId: string | null;
}

export interface Bundle {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentBundleId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleTreeNode extends Bundle {
  children: BundleTreeNode[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  bundleId: string | null;
  tags: string[];
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
