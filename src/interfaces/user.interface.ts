interface PlanData {
    name: string;
    max_bots: number;
    max_connections: number;
    max_signals: number;
}

interface User {
    _id: string;
    email: string;
    name: string;
    password: string;
}

export default interface UserInterface {
    refreshToken: string;
    token: string;
    plan_data: PlanData;
    tokenExpires: number;
    user: User;
}
