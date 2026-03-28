/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export type ExternalBlob = Uint8Array;
export interface InviteCode {
  'code' : string,
  'created' : bigint,
  'used' : boolean,
}
export interface PhotoRecord {
  'id' : bigint,
  'blob' : ExternalBlob,
  'caption' : string,
  'uploadedAt' : bigint,
}
export interface SongRecord {
  'id' : bigint,
  'title' : string,
  'blob' : ExternalBlob,
  'artist' : string,
  'uploadedAt' : bigint,
}
export interface UserProfile { 'name' : string }
export type UserRole = { 'admin' : null } |
  { 'user' : null } |
  { 'guest' : null };
export interface WishRecord {
  'id' : bigint,
  'name' : string,
  'submittedAt' : bigint,
  'message' : string,
}
export interface _CaffeineStorageCreateCertificateResult {
  'method' : string,
  'blob_hash' : string,
}
export interface _CaffeineStorageRefillInformation {
  'proposed_top_up_amount' : [] | [bigint],
}
export interface _CaffeineStorageRefillResult {
  'success' : [] | [boolean],
  'topped_up_amount' : [] | [bigint],
}
export interface _SERVICE {
  '_caffeineStorageBlobIsLive' : ActorMethod<[Uint8Array], boolean>,
  '_caffeineStorageBlobsToDelete' : ActorMethod<[], Array<Uint8Array>>,
  '_caffeineStorageConfirmBlobDeletion' : ActorMethod<[Array<Uint8Array>], undefined>,
  '_caffeineStorageCreateCertificate' : ActorMethod<[string], _CaffeineStorageCreateCertificateResult>,
  '_caffeineStorageRefillCashier' : ActorMethod<[[] | [_CaffeineStorageRefillInformation]], _CaffeineStorageRefillResult>,
  '_caffeineStorageUpdateGatewayPrincipals' : ActorMethod<[], undefined>,
  '_initializeAccessControlWithSecret' : ActorMethod<[string], undefined>,
  'addPhoto' : ActorMethod<[ExternalBlob, string], PhotoRecord>,
  'addSong' : ActorMethod<[ExternalBlob, string, string], SongRecord>,
  'assignCallerUserRole' : ActorMethod<[Principal, UserRole], undefined>,
  'claimFirstAdmin' : ActorMethod<[], boolean>,
  'deletePhoto' : ActorMethod<[bigint], boolean>,
  'deleteSong' : ActorMethod<[bigint], boolean>,
  'deleteWish' : ActorMethod<[bigint], boolean>,
  'generateInviteCode' : ActorMethod<[string], string>,
  'getBackgroundMusic' : ActorMethod<[], [] | [ExternalBlob]>,
  'getCallerUserProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getCallerUserRole' : ActorMethod<[], UserRole>,
  'getGuestPasswordSet' : ActorMethod<[], boolean>,
  'getUserProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'isCallerAdmin' : ActorMethod<[], boolean>,
  'listInviteCodes' : ActorMethod<[], Array<InviteCode>>,
  'listPhotos' : ActorMethod<[], Array<PhotoRecord>>,
  'listSongs' : ActorMethod<[], Array<SongRecord>>,
  'listWishes' : ActorMethod<[], Array<WishRecord>>,
  'revokeInviteCode' : ActorMethod<[string], boolean>,
  'saveCallerUserProfile' : ActorMethod<[UserProfile], undefined>,
  'setBackgroundMusic' : ActorMethod<[ExternalBlob], undefined>,
  'setGuestPassword' : ActorMethod<[string], undefined>,
  'submitWish' : ActorMethod<[string, string], WishRecord>,
  'validateGuestPassword' : ActorMethod<[string], boolean>,
  'validateInviteCode' : ActorMethod<[string], boolean>,
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
