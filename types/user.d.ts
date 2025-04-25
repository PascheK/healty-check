export interface Goal {
  title: string;
  checked: boolean;
}

export interface Category {
  name: string;
  goals: Goal[];
}

export interface UserData {
  code: string;
  firstName: string;
  lastName: string;
  categories: Category[];
  role?: 'admin' | 'user';
}
