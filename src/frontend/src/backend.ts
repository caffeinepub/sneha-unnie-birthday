import { Actor, HttpAgent, type ActorSubclass } from "@dfinity/agent";
import { idlFactory } from "./declarations/backend.did.js";
import type {
    _SERVICE,
    ExternalBlob as _ExternalBlob,
    InviteCode as _InviteCode,
    PhotoRecord as _PhotoRecord,
    SongRecord as _SongRecord,
    UserProfile as _UserProfile,
    UserRole as _UserRole,
    WishRecord as _WishRecord,
    _CaffeineStorageRefillInformation as __CaffeineStorageRefillInformation,
    _CaffeineStorageRefillResult as __CaffeineStorageRefillResult,
    _CaffeineStorageCreateCertificateResult as __CaffeineStorageCreateCertificateResult,
} from "./declarations/backend.did.d.ts";
import type { Principal } from "@dfinity/principal";

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    mimeType?: string;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null, mimeType?: string) {
        if (blob) {
            this._blob = blob;
        }
        this.directURL = directURL;
        this.mimeType = mimeType;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>, mimeType?: string): ExternalBlob {
        const url = URL.createObjectURL(new Blob([
            new Uint8Array(blob)
        ], {
            type: mimeType || 'application/octet-stream'
        }));
        return new ExternalBlob(url, blob, mimeType);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) {
            return this._blob;
        }
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string {
        return this.directURL;
    }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

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
export interface _CaffeineStorageRefillResult {
    success?: boolean;
    topped_up_amount?: bigint;
}

export interface CreateActorOptions {
    agentOptions?: {
        identity?: any;
        host?: string;
    };
    agent?: HttpAgent;
    processError?: (error: unknown) => never;
}

export class backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        private processError?: (error: unknown) => never
    ) {}

    async _initializeAccessControlWithSecret(secret: string): Promise<void> {
        try {
            await this.actor._initializeAccessControlWithSecret(secret);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean> {
        return this.actor._caffeineStorageBlobIsLive(hash);
    }

    async _caffeineStorageBlobsToDelete(): Promise<Array<Uint8Array>> {
        return this.actor._caffeineStorageBlobsToDelete();
    }

    async _caffeineStorageConfirmBlobDeletion(hashes: Array<Uint8Array>): Promise<void> {
        await this.actor._caffeineStorageConfirmBlobDeletion(hashes);
    }

    async _caffeineStorageCreateCertificate(hash: string): Promise<__CaffeineStorageCreateCertificateResult> {
        return this.actor._caffeineStorageCreateCertificate(hash);
    }

    async _caffeineStorageRefillCashier(info: [] | [__CaffeineStorageRefillInformation]): Promise<__CaffeineStorageRefillResult> {
        return this.actor._caffeineStorageRefillCashier(info);
    }

    async _caffeineStorageUpdateGatewayPrincipals(): Promise<void> {
        await this.actor._caffeineStorageUpdateGatewayPrincipals();
    }

    async addPhoto(arg0: ExternalBlob, arg1: string): Promise<PhotoRecord> {
        try {
            const result = await this.actor.addPhoto(
                await to_candid_ExternalBlob(this._uploadFile, arg0),
                arg1
            );
            return await from_candid_PhotoRecord(this._uploadFile, this._downloadFile, result);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async addSong(arg0: ExternalBlob, arg1: string, arg2: string): Promise<SongRecord> {
        try {
            const result = await this.actor.addSong(
                await to_candid_ExternalBlob(this._uploadFile, arg0),
                arg1,
                arg2
            );
            return await from_candid_SongRecord(this._uploadFile, this._downloadFile, result);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async assignCallerUserRole(user: Principal, role: UserRole): Promise<void> {
        try {
            await this.actor.assignCallerUserRole(user, to_candid_UserRole(role));
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async claimFirstAdmin(): Promise<boolean> {
        try {
            return await this.actor.claimFirstAdmin();
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async deletePhoto(id: bigint): Promise<boolean> {
        try {
            return await this.actor.deletePhoto(id);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async deleteSong(id: bigint): Promise<boolean> {
        try {
            return await this.actor.deleteSong(id);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async deleteWish(id: bigint): Promise<boolean> {
        try {
            return await this.actor.deleteWish(id);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async generateInviteCode(code: string): Promise<string> {
        try {
            return await this.actor.generateInviteCode(code);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async getBackgroundMusic(): Promise<ExternalBlob | null> {
        try {
            const result = await this.actor.getBackgroundMusic();
            return await from_candid_opt_ExternalBlob(this._uploadFile, this._downloadFile, result);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async getCallerUserProfile(): Promise<UserProfile | null> {
        try {
            const result = await this.actor.getCallerUserProfile();
            return result.length > 0 ? from_candid_UserProfile(result[0]!) : null;
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async getCallerUserRole(): Promise<UserRole> {
        try {
            const result = await this.actor.getCallerUserRole();
            return from_candid_UserRole(result);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async getGuestPasswordSet(): Promise<boolean> {
        try {
            return await this.actor.getGuestPasswordSet();
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async getUserProfile(user: Principal): Promise<UserProfile | null> {
        try {
            const result = await this.actor.getUserProfile(user);
            return result.length > 0 ? from_candid_UserProfile(result[0]!) : null;
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async isCallerAdmin(): Promise<boolean> {
        try {
            return await this.actor.isCallerAdmin();
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async listInviteCodes(): Promise<Array<InviteCodeRecord>> {
        try {
            const results = await this.actor.listInviteCodes();
            return results.map((r: _InviteCode) => ({
                code: r.code,
                created: r.created,
                used: r.used,
            }));
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async listPhotos(): Promise<Array<PhotoRecord>> {
        try {
            const results = await this.actor.listPhotos();
            return Promise.all(results.map((r) => from_candid_PhotoRecord(this._uploadFile, this._downloadFile, r)));
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async listSongs(): Promise<Array<SongRecord>> {
        try {
            const results = await this.actor.listSongs();
            return Promise.all(results.map((r) => from_candid_SongRecord(this._uploadFile, this._downloadFile, r)));
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async listWishes(): Promise<Array<WishRecord>> {
        try {
            const results = await this.actor.listWishes();
            return results.map(from_candid_WishRecord);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async revokeInviteCode(code: string): Promise<boolean> {
        try {
            return await this.actor.revokeInviteCode(code);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async saveCallerUserProfile(profile: UserProfile): Promise<void> {
        try {
            await this.actor.saveCallerUserProfile(profile);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async setBackgroundMusic(arg0: ExternalBlob): Promise<void> {
        try {
            await this.actor.setBackgroundMusic(
                await to_candid_ExternalBlob(this._uploadFile, arg0)
            );
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async setGuestPassword(password: string): Promise<void> {
        try {
            await this.actor.setGuestPassword(password);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async submitWish(name: string, message: string): Promise<WishRecord> {
        try {
            const result = await this.actor.submitWish(name, message);
            return from_candid_WishRecord(result);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async validateGuestPassword(password: string): Promise<boolean> {
        try {
            return await this.actor.validateGuestPassword(password);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

    async validateInviteCode(code: string): Promise<boolean> {
        try {
            return await this.actor.validateInviteCode(code);
        } catch (e) {
            this.processError?.(e);
            throw e;
        }
    }

}

export function createActor(
    canisterId: string,
    uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options?: CreateActorOptions & { agent?: HttpAgent; processError?: (error: unknown) => never }
): backendInterface {
    const agent = options?.agent ?? new HttpAgent({
        ...options?.agentOptions,
    });
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId,
    });
    return new backendInterface(actor, uploadFile, downloadFile, options?.processError);
}

// Candid conversion helpers

async function to_candid_ExternalBlob(
    uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    value: ExternalBlob
): Promise<_ExternalBlob> {
    return uploadFile(value);
}

async function from_candid_ExternalBlob(
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    value: _ExternalBlob
): Promise<ExternalBlob> {
    return downloadFile(value);
}

async function from_candid_PhotoRecord(
    uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    value: _PhotoRecord
): Promise<PhotoRecord> {
    return {
        id: value.id,
        blob: await from_candid_ExternalBlob(uploadFile, downloadFile, value.blob),
        caption: value.caption,
        uploadedAt: value.uploadedAt,
    };
}

async function from_candid_SongRecord(
    uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    value: _SongRecord
): Promise<SongRecord> {
    return {
        id: value.id,
        title: value.title,
        blob: await from_candid_ExternalBlob(uploadFile, downloadFile, value.blob),
        artist: value.artist,
        uploadedAt: value.uploadedAt,
    };
}

function from_candid_WishRecord(value: _WishRecord): WishRecord {
    return {
        id: value.id,
        name: value.name,
        submittedAt: value.submittedAt,
        message: value.message,
    };
}

function from_candid_UserProfile(value: _UserProfile): UserProfile {
    return { name: value.name };
}

function from_candid_UserRole(value: _UserRole): UserRole {
    if ('admin' in value) return UserRole.admin;
    if ('user' in value) return UserRole.user;
    return UserRole.guest;
}

function to_candid_UserRole(value: UserRole): _UserRole {
    if (value === UserRole.admin) return { admin: null };
    if (value === UserRole.user) return { user: null };
    return { guest: null };
}

async function from_candid_opt_ExternalBlob(
    uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    value: [] | [_ExternalBlob]
): Promise<ExternalBlob | null> {
    if (value.length === 0) return null;
    return from_candid_ExternalBlob(uploadFile, downloadFile, value[0]!);
}
