import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AIMessage {
    content: string;
    role: string;
    timestamp: Time;
}
export type Time = bigint;
export interface Project {
    id: string;
    title: string;
    scriptContent: string;
    createdAt: Time;
    designNotes: string;
    videoNotes: string;
    updatedAt: Time;
    stage: ProjectStage;
    aiHistory: Array<AIMessage>;
}
export interface UserProfile {
    name: string;
}
export enum ProjectStage {
    video = "video",
    idea = "idea",
    script = "script",
    published = "published",
    visuals = "visuals"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAIMessage(projectId: string, role: string, content: string): Promise<boolean>;
    adminBanUser(target: Principal): Promise<void>;
    adminIsBanned(target: Principal): Promise<boolean>;
    adminUnbanUser(target: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(title: string): Promise<string>;
    deleteProject(id: string): Promise<boolean>;
    getAIHistory(projectId: string): Promise<Array<AIMessage>>;
    getBanTimestamp(): Promise<Time>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: string): Promise<Project | null>;
    getProjects(): Promise<Array<Project>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isBanned(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProject(id: string, title: string, scriptContent: string, designNotes: string, videoNotes: string): Promise<boolean>;
    updateProjectStage(id: string, stage: ProjectStage): Promise<boolean>;
}
