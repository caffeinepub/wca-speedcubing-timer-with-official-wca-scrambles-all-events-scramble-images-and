import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export type SignupResult = {
    __kind__: "failure";
    failure: {
        message: string;
    };
} | {
    __kind__: "success";
    success: {
        user: AuthenticatedPrincipal;
        session?: Session;
        message: string;
        sessionToken: string;
    };
};
export interface Session {
    created: Timestamp;
    token: AuthToken;
    lastAccessed: Timestamp;
    expiration: Timestamp;
}
export type AuthenticatedPrincipal = {
    __kind__: "internetIdentity";
    internetIdentity: Principal;
} | {
    __kind__: "emailPassword";
    emailPassword: Email;
};
export type LogoutResult = {
    __kind__: "failure";
    failure: {
        message: string;
    };
} | {
    __kind__: "success";
    success: {
        message: string;
    };
};
export type AuthToken = string;
export type LoginResult = {
    __kind__: "failure";
    failure: {
        message: string;
    };
} | {
    __kind__: "success";
    success: {
        user: AuthenticatedPrincipal;
        session?: Session;
        message: string;
        sessionToken: string;
    };
};
export interface SessionValidationResult {
    user?: AuthenticatedPrincipal;
    session?: Session;
    message: string;
    isValid: boolean;
}
export interface UserProfile {
    name: string;
}
export type Email = string;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    login(email: string, password: string): Promise<LoginResult>;
    logout(token: string): Promise<LogoutResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    signup(email: string, password: string): Promise<SignupResult>;
    validateSession(token: string): Promise<SessionValidationResult>;
}
