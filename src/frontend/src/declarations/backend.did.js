/* eslint-disable */

// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

export const _CaffeineStorageCreateCertificateResult = IDL.Record({
  'method' : IDL.Text,
  'blob_hash' : IDL.Text,
});
export const _CaffeineStorageRefillInformation = IDL.Record({
  'proposed_top_up_amount' : IDL.Opt(IDL.Nat),
});
export const _CaffeineStorageRefillResult = IDL.Record({
  'success' : IDL.Opt(IDL.Bool),
  'topped_up_amount' : IDL.Opt(IDL.Nat),
});
export const ExternalBlob = IDL.Vec(IDL.Nat8);
export const PhotoRecord = IDL.Record({
  'id' : IDL.Nat,
  'blob' : ExternalBlob,
  'caption' : IDL.Text,
  'uploadedAt' : IDL.Int,
});
export const SongRecord = IDL.Record({
  'id' : IDL.Nat,
  'title' : IDL.Text,
  'blob' : ExternalBlob,
  'artist' : IDL.Text,
  'uploadedAt' : IDL.Int,
});
export const UserRole = IDL.Variant({
  'admin' : IDL.Null,
  'user' : IDL.Null,
  'guest' : IDL.Null,
});
export const UserProfile = IDL.Record({ 'name' : IDL.Text });
export const WishRecord = IDL.Record({
  'id' : IDL.Nat,
  'name' : IDL.Text,
  'submittedAt' : IDL.Int,
  'message' : IDL.Text,
});

export const idlService = IDL.Service({
  '_caffeineStorageBlobIsLive' : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
  '_caffeineStorageBlobsToDelete' : IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
  '_caffeineStorageConfirmBlobDeletion' : IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
  '_caffeineStorageCreateCertificate' : IDL.Func([IDL.Text], [_CaffeineStorageCreateCertificateResult], []),
  '_caffeineStorageRefillCashier' : IDL.Func([IDL.Opt(_CaffeineStorageRefillInformation)], [_CaffeineStorageRefillResult], []),
  '_caffeineStorageUpdateGatewayPrincipals' : IDL.Func([], [], []),
  '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
  'addPhoto' : IDL.Func([ExternalBlob, IDL.Text], [PhotoRecord], []),
  'addSong' : IDL.Func([ExternalBlob, IDL.Text, IDL.Text], [SongRecord], []),
  'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
  'claimFirstAdmin' : IDL.Func([], [IDL.Bool], []),
  'deletePhoto' : IDL.Func([IDL.Nat], [IDL.Bool], []),
  'deleteSong' : IDL.Func([IDL.Nat], [IDL.Bool], []),
  'deleteWish' : IDL.Func([IDL.Nat], [IDL.Bool], []),
  'getBackgroundMusic' : IDL.Func([], [IDL.Opt(ExternalBlob)], ['query']),
  'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
  'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
  'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
  'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
  'listPhotos' : IDL.Func([], [IDL.Vec(PhotoRecord)], ['query']),
  'listSongs' : IDL.Func([], [IDL.Vec(SongRecord)], ['query']),
  'listWishes' : IDL.Func([], [IDL.Vec(WishRecord)], ['query']),
  'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
  'setBackgroundMusic' : IDL.Func([ExternalBlob], [], []),
  'submitWish' : IDL.Func([IDL.Text, IDL.Text], [WishRecord], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const _CaffeineStorageCreateCertificateResult = IDL.Record({ 'method' : IDL.Text, 'blob_hash' : IDL.Text });
  const _CaffeineStorageRefillInformation = IDL.Record({ 'proposed_top_up_amount' : IDL.Opt(IDL.Nat) });
  const _CaffeineStorageRefillResult = IDL.Record({ 'success' : IDL.Opt(IDL.Bool), 'topped_up_amount' : IDL.Opt(IDL.Nat) });
  const ExternalBlob = IDL.Vec(IDL.Nat8);
  const PhotoRecord = IDL.Record({ 'id' : IDL.Nat, 'blob' : ExternalBlob, 'caption' : IDL.Text, 'uploadedAt' : IDL.Int });
  const SongRecord = IDL.Record({ 'id' : IDL.Nat, 'title' : IDL.Text, 'blob' : ExternalBlob, 'artist' : IDL.Text, 'uploadedAt' : IDL.Int });
  const UserRole = IDL.Variant({ 'admin' : IDL.Null, 'user' : IDL.Null, 'guest' : IDL.Null });
  const UserProfile = IDL.Record({ 'name' : IDL.Text });
  const WishRecord = IDL.Record({ 'id' : IDL.Nat, 'name' : IDL.Text, 'submittedAt' : IDL.Int, 'message' : IDL.Text });
  return IDL.Service({
    '_caffeineStorageBlobIsLive' : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
    '_caffeineStorageBlobsToDelete' : IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
    '_caffeineStorageConfirmBlobDeletion' : IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
    '_caffeineStorageCreateCertificate' : IDL.Func([IDL.Text], [_CaffeineStorageCreateCertificateResult], []),
    '_caffeineStorageRefillCashier' : IDL.Func([IDL.Opt(_CaffeineStorageRefillInformation)], [_CaffeineStorageRefillResult], []),
    '_caffeineStorageUpdateGatewayPrincipals' : IDL.Func([], [], []),
    '_initializeAccessControlWithSecret' : IDL.Func([IDL.Text], [], []),
    'addPhoto' : IDL.Func([ExternalBlob, IDL.Text], [PhotoRecord], []),
    'addSong' : IDL.Func([ExternalBlob, IDL.Text, IDL.Text], [SongRecord], []),
    'assignCallerUserRole' : IDL.Func([IDL.Principal, UserRole], [], []),
    'claimFirstAdmin' : IDL.Func([], [IDL.Bool], []),
    'deletePhoto' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'deleteSong' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'deleteWish' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getBackgroundMusic' : IDL.Func([], [IDL.Opt(ExternalBlob)], ['query']),
    'getCallerUserProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getCallerUserRole' : IDL.Func([], [UserRole], ['query']),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'isCallerAdmin' : IDL.Func([], [IDL.Bool], ['query']),
    'listPhotos' : IDL.Func([], [IDL.Vec(PhotoRecord)], ['query']),
    'listSongs' : IDL.Func([], [IDL.Vec(SongRecord)], ['query']),
    'listWishes' : IDL.Func([], [IDL.Vec(WishRecord)], ['query']),
    'saveCallerUserProfile' : IDL.Func([UserProfile], [], []),
    'setBackgroundMusic' : IDL.Func([ExternalBlob], [], []),
    'submitWish' : IDL.Func([IDL.Text, IDL.Text], [WishRecord], []),
  });
};

export const init = ({ IDL }) => { return []; };
