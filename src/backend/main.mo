import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinks "invite-links/invite-links-module";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  stable var stablePhotos : [PhotoRecord] = [];
  stable var stableWishes : [WishRecord] = [];
  stable var stableSongs : [SongRecord] = [];
  stable var stablePhotoId : Nat = 0;
  stable var stableWishId : Nat = 0;
  stable var stableSongId : Nat = 0;
  stable var stableBackgroundMusic : ?Storage.ExternalBlob = null;
  stable var stableUserRoles : [(Principal, AccessControl.UserRole)] = [];
  stable var stableAdminAssigned : Bool = false;
  stable var stableInviteCodes : [(Text, InviteLinks.InviteCode)] = [];
  stable var stableGuestPassword : Text = "";

  public type UserProfile = { name : Text };

  type PhotoRecord = { id : Nat; blob : Storage.ExternalBlob; caption : Text; uploadedAt : Int };
  module PhotoRecord {
    public func compare(p1 : PhotoRecord, p2 : PhotoRecord) : Order.Order {
      Int.compare(p2.uploadedAt, p1.uploadedAt);
    };
  };

  type WishRecord = { id : Nat; name : Text; message : Text; submittedAt : Int };
  module WishRecord {
    public func compare(w1 : WishRecord, w2 : WishRecord) : Order.Order {
      Int.compare(w2.submittedAt, w1.submittedAt);
    };
  };

  type SongRecord = { id : Nat; blob : Storage.ExternalBlob; title : Text; artist : Text; uploadedAt : Int };
  module SongRecord {
    public func compare(s1 : SongRecord, s2 : SongRecord) : Order.Order {
      Int.compare(s2.uploadedAt, s1.uploadedAt);
    };
  };

  let photoStore = Map.empty<Nat, PhotoRecord>();
  let wishStore = Map.empty<Nat, WishRecord>();
  let songStore = Map.empty<Nat, SongRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let inviteLinksState = InviteLinks.initState();
  var photoId = stablePhotoId;
  var wishId = stableWishId;
  var songId = stableSongId;
  var backgroundMusic : ?Storage.ExternalBlob = stableBackgroundMusic;
  var guestPassword : Text = stableGuestPassword;

  do {
    for (photo in stablePhotos.vals()) { photoStore.add(photo.id, photo) };
    for (wish in stableWishes.vals()) { wishStore.add(wish.id, wish) };
    for (song in stableSongs.vals()) { songStore.add(song.id, song) };
    for ((p, r) in stableUserRoles.vals()) { accessControlState.userRoles.add(p, r) };
    for ((k, v) in stableInviteCodes.vals()) { inviteLinksState.inviteCodes.add(k, v) };
    accessControlState.adminAssigned := stableAdminAssigned;
  };

  system func preupgrade() {
    stablePhotos := photoStore.values().toArray();
    stableWishes := wishStore.values().toArray();
    stableSongs := songStore.values().toArray();
    stablePhotoId := photoId;
    stableWishId := wishId;
    stableSongId := songId;
    stableBackgroundMusic := backgroundMusic;
    stableUserRoles := accessControlState.userRoles.entries().toArray();
    stableAdminAssigned := accessControlState.adminAssigned;
    stableInviteCodes := inviteLinksState.inviteCodes.entries().toArray();
    stableGuestPassword := guestPassword;
  };

  public shared ({ caller }) func claimFirstAdmin() : async Bool {
    if (caller.isAnonymous()) { return false };
    if (accessControlState.adminAssigned) { return false };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    true;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.add(caller, profile);
  };

  // Guest password methods
  public shared ({ caller }) func setGuestPassword(password : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    guestPassword := password;
  };

  public query func validateGuestPassword(password : Text) : async Bool {
    if (Text.equal(guestPassword, "")) { return true }; // no password set = open
    Text.equal(guestPassword, password);
  };

  public query ({ caller }) func getGuestPasswordSet() : async Bool {
    AccessControl.isAdmin(accessControlState, caller) and not Text.equal(guestPassword, "");
  };

  // Invite link methods
  public shared ({ caller }) func generateInviteCode(code : Text) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    InviteLinks.generateInviteCode(inviteLinksState, code);
    code;
  };

  public query func validateInviteCode(code : Text) : async Bool {
    switch (inviteLinksState.inviteCodes.get(code)) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query ({ caller }) func listInviteCodes() : async [InviteLinks.InviteCode] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    InviteLinks.getInviteCodes(inviteLinksState);
  };

  public shared ({ caller }) func revokeInviteCode(code : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (inviteLinksState.inviteCodes.get(code)) {
      case (null) { false };
      case (?_) { inviteLinksState.inviteCodes.remove(code); true };
    };
  };

  public shared ({ caller }) func addPhoto(blob : Storage.ExternalBlob, caption : Text) : async PhotoRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    let id = photoId;
    let photo : PhotoRecord = { id; blob; caption; uploadedAt = Time.now() };
    photoStore.add(id, photo);
    photoId += 1;
    photo;
  };

  public query ({ caller }) func listPhotos() : async [PhotoRecord] {
    photoStore.values().toArray().sort();
  };

  public shared ({ caller }) func deletePhoto(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (photoStore.get(id)) {
      case (null) { false };
      case (?_) { photoStore.remove(id); true };
    };
  };

  public shared ({ caller }) func submitWish(name : Text, message : Text) : async WishRecord {
    if (Text.equal(name, "") or Text.equal(message, "")) {
      Runtime.trap("Name and message cannot be empty");
    };
    if (Int.abs(message.size()) > 500) { Runtime.trap("Message too long") };
    let wish : WishRecord = { id = wishId; name; message; submittedAt = Time.now() };
    wishStore.add(wishId, wish);
    wishId += 1;
    wish;
  };

  public query ({ caller }) func listWishes() : async [WishRecord] {
    wishStore.values().toArray().sort();
  };

  public shared ({ caller }) func deleteWish(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (wishStore.get(id)) {
      case (null) { false };
      case (?_) { wishStore.remove(id); true };
    };
  };

  public shared ({ caller }) func addSong(blob : Storage.ExternalBlob, title : Text, artist : Text) : async SongRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    if (songStore.size() >= 20) { Runtime.trap("Maximum of 20 songs reached") };
    let song : SongRecord = { id = songId; blob; title; artist; uploadedAt = Time.now() };
    songStore.add(songId, song);
    songId += 1;
    song;
  };

  public query ({ caller }) func listSongs() : async [SongRecord] {
    songStore.values().toArray();
  };

  public shared ({ caller }) func deleteSong(id : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (songStore.get(id)) {
      case (null) { false };
      case (?_) { songStore.remove(id); true };
    };
  };

  public shared ({ caller }) func setBackgroundMusic(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    backgroundMusic := ?blob;
  };

  public query ({ caller }) func getBackgroundMusic() : async ?Storage.ExternalBlob {
    backgroundMusic;
  };
};
