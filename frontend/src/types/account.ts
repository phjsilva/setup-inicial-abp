export interface Account {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'visualizador';
}

export interface Session {
    token: string;
    user: Account;
}
