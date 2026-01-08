interface Memo {
  memoId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Criterion {
  id: string;
  name: string;
  priority: string;
}

interface Product {
  id: string;
  name: string;
  evaluations: Record<string, string>;
  isSelected: boolean;
}

export { Criterion, Memo, Product };
