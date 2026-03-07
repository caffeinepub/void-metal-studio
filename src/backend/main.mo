
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  stable let bans = Map.empty<Principal, Time.Time>();
  let userProfiles = Map.empty<Principal, { name : Text }>();

  public type UserProfile = { name : Text };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Check whether the calling user is banned (self-check only)
  public query ({ caller }) func isBanned() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check ban status");
    };
    bans.containsKey(caller);
  };

  // Admin-only: ban a target user by principal
  public shared ({ caller }) func adminBanUser(target : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };
    if (bans.containsKey(target)) { return };
    bans.add(target, Time.now());
  };

  // Admin-only: unban a target user by principal
  public shared ({ caller }) func adminUnbanUser(target : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bans.remove(target);
  };

  // Get the ban timestamp for the calling user
  public query ({ caller }) func getBanTimestamp() : async Time.Time {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check ban timestamp");
    };
    switch (bans.get(caller)) {
      case (null) { Runtime.trap("User is not banned") };
      case (?timestamp) { timestamp };
    };
  };

  // Admin-only: check whether a specific user is banned
  public query ({ caller }) func adminIsBanned(target : Principal) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can check ban status of other users");
    };
    bans.containsKey(target);
  };
};
