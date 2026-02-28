import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stores banned users with their ban timestamp
  let bans = Map.empty<Principal, Time.Time>();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Get the caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile (caller can view own, admins can view any)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save the caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Check if the caller is banned — any authenticated user can check their own status
  public query ({ caller }) func isBanned() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check ban status");
    };
    bans.containsKey(caller);
  };

  // Self-ban: called by the frontend when a content theft violation is detected
  // Only authenticated users can be meaningfully banned (anonymous principals are ephemeral)
  public shared ({ caller }) func banUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can be banned");
    };
    if (bans.containsKey(caller)) {
      return;
    };
    bans.add(caller, Time.now());
  };

  // Admin function: ban a specific user by principal
  public shared ({ caller }) func adminBanUser(target : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can ban other users");
    };
    if (bans.containsKey(target)) {
      return;
    };
    bans.add(target, Time.now());
  };

  // Admin function: unban a specific user by principal
  public shared ({ caller }) func adminUnbanUser(target : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bans.remove(target);
  };

  // Get the ban timestamp for the caller if they are banned
  public query ({ caller }) func getBanTimestamp() : async Time.Time {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check ban timestamp");
    };
    switch (bans.get(caller)) {
      case (null) {
        Runtime.trap("User is not banned");
      };
      case (?timestamp) {
        timestamp;
      };
    };
  };
};
