import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PhotoRecord {
    id: bigint;
    blob: ExternalBlob;
    caption: string;
    uploadedAt: bigint;
}
export interface WishRecord {
    id: bigint;
    name: string;
    submittedAt: bigint;
    message: string;
}
export interface UserProfile {
    name: string;
}
export interface SongRecord {
    id: bigint;
    title: string;
    blob: ExternalBlob;
    artist: string;
    uploadedAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface InviteCodeRecord {
    code: string;
    created: bigint;
    used: boolean;
}
export interface backendInterface {
    addPhoto(blob: ExternalBlob, caption: string): Promise<PhotoRecord>;
    addSong(blob: ExternalBlob, title: string, artist: string): Promise<SongRecord>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePhoto(id: bigint): Promise<boolean>;
    deleteSong(id: bigint): Promise<boolean>;
    deleteWish(id: bigint): Promise<boolean>;
    generateInviteCode(code: string): Promise<string>;
    getBackgroundMusic(): Promise<ExternalBlob | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listInviteCodes(): Promise<Array<InviteCodeRecord>>;
    listPhotos(): Promise<Array<PhotoRecord>>;
    listSongs(): Promise<Array<SongRecord>>;
    listWishes(): Promise<Array<WishRecord>>;
    revokeInviteCode(code: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBackgroundMusic(blob: ExternalBlob): Promise<void>;
    setGuestPassword(password: string): Promise<void>;
    submitWish(name: string, message: string): Promise<WishRecord>;
    validateGuestPassword(password: string): Promise<boolean>;
    validateInviteCode(code: string): Promise<boolean>;
}
