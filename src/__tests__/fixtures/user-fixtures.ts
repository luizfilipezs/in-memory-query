export interface Address {
  id: number;
  country: string;
  city: string;
  createdAt: number;
}

export const addresses: Address[] = [
  { id: 1, country: 'Brazil', city: 'Brasília', createdAt: 1 },
  { id: 2, country: 'Brazil', city: 'São Paulo', createdAt: 2 },
  { id: 3, country: 'Brazil', city: 'Rio de Janeiro', createdAt: 3 },

  { id: 4, country: 'Chile', city: 'Santiago', createdAt: 1 },
  { id: 5, country: 'Chile', city: 'Valparaíso', createdAt: 2 },
  { id: 6, country: 'Chile', city: 'Concepción', createdAt: 3 },

  { id: 7, country: 'Argentina', city: 'Buenos Aires', createdAt: 1 },
  { id: 8, country: 'Argentina', city: 'Córdoba', createdAt: 2 },
];

export interface UserPermissions {
  useCookies: boolean;
  sendNotifications: boolean;
}

export class User {
  constructor(
    public id: number,
    public name: string,
    public permissions: UserPermissions,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public address: Address
  ) {}

  isAdmin(): boolean {
    return this.id === 1;
  }
}

export const users: User[] = [
  new User(
    1,
    'John',
    { useCookies: true, sendNotifications: true },
    true,
    new Date('2023-01-01'),
    new Date('2023-01-10'),
    addresses[0]!
  ),
  new User(
    2,
    'Mary',
    { useCookies: false, sendNotifications: true },
    false,
    new Date('2023-02-01'),
    new Date('2023-02-10'),
    addresses[7]!
  ),
  new User(
    3,
    'Bob',
    { useCookies: true, sendNotifications: false },
    true,
    new Date('2023-03-01'),
    new Date('2023-03-10'),
    addresses[1]!
  ),
];
