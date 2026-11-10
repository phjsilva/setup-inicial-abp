export interface Account {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'visualizador';
}

export interface SessionAccount extends Account {
    sessionVersion: number;
}

export interface Credentials extends SessionAccount {
    passwordHash: string;
}
