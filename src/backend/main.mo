import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, { name : Text }>();
  let bans = Map.empty<Principal, Time.Time>();

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

  public query ({ caller }) func isBanned() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check ban status");
    };
    bans.containsKey(caller);
  };

  public shared ({ caller }) func adminBanUser(target : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };
    if (bans.containsKey(target)) { return };
    bans.add(target, Time.now());
  };

  public shared ({ caller }) func adminUnbanUser(target : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };
    bans.remove(target);
  };

  public query ({ caller }) func getBanTimestamp() : async Time.Time {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check ban timestamp");
    };
    switch (bans.get(caller)) {
      case (null) { Runtime.trap("User is not banned") };
      case (?timestamp) { timestamp };
    };
  };

  public query ({ caller }) func adminIsBanned(target : Principal) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can check ban status of other users");
    };
    bans.containsKey(target);
  };

  // Project management
  public type ProjectStage = { #idea; #script; #visuals; #video; #published };

  public type AIMessage = {
    role : Text;
    content : Text;
    timestamp : Time.Time;
  };

  public type Project = {
    id : Text;
    title : Text;
    stage : ProjectStage;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    scriptContent : Text;
    designNotes : Text;
    videoNotes : Text;
    aiHistory : [AIMessage];
  };

  type StableProject = {
    id : Text;
    title : Text;
    stage : ProjectStage;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    scriptContent : Text;
    designNotes : Text;
    videoNotes : Text;
    aiHistory : List.List<AIMessage>;
  };

  let projects = Map.empty<Principal, Map.Map<Text, StableProject>>();

  func getEmptyProjectMapForUser(caller : Principal) : Map.Map<Text, StableProject> {
    switch (projects.get(caller)) {
      case (null) { Map.empty<Text, StableProject>() };
      case (?userProjects) { userProjects };
    };
  };

  public shared ({ caller }) func createProject(title : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create projects");
    };
    let id = title # Time.now().toText();
    let project : StableProject = {
      id;
      title;
      stage = #idea;
      createdAt = Time.now();
      updatedAt = Time.now();
      scriptContent = "";
      designNotes = "";
      videoNotes = "";
      aiHistory = List.empty<AIMessage>();
    };
    let userProjects = getEmptyProjectMapForUser(caller);
    userProjects.add(id, project);
    projects.add(caller, userProjects);
    id;
  };

  public query ({ caller }) func getProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get projects");
    };
    let userProjects = getEmptyProjectMapForUser(caller);
    userProjects.values().toArray().map(
      func(p) {
        { p with aiHistory = p.aiHistory.toArray() };
      }
    );
  };

  public query ({ caller }) func getProject(id : Text) : async ?Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get a project");
    };
    switch (getEmptyProjectMapForUser(caller).get(id)) {
      case (null) { null };
      case (?project) {
        ?{ project with aiHistory = project.aiHistory.toArray() };
      };
    };
  };

  public shared ({ caller }) func updateProject(
    id : Text,
    title : Text,
    scriptContent : Text,
    designNotes : Text,
    videoNotes : Text,
  ) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update projects");
    };
    let userProjects = getEmptyProjectMapForUser(caller);
    switch (userProjects.get(id)) {
      case (null) { false };
      case (?project) {
        let updatedProject = {
          project with
          title;
          scriptContent;
          designNotes;
          videoNotes;
          updatedAt = Time.now();
        };
        userProjects.add(id, updatedProject);
        projects.add(caller, userProjects);
        true;
      };
    };
  };

  public shared ({ caller }) func updateProjectStage(id : Text, stage : ProjectStage) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update project stage");
    };
    let userProjects = getEmptyProjectMapForUser(caller);
    switch (userProjects.get(id)) {
      case (null) { false };
      case (?project) {
        let updatedProject = { project with stage; updatedAt = Time.now() };
        userProjects.add(id, updatedProject);
        projects.add(caller, userProjects);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete projects");
    };
    let userProjects = getEmptyProjectMapForUser(caller);
    if (not userProjects.containsKey(id)) { false } else {
      userProjects.remove(id);
      projects.add(caller, userProjects);
      true;
    };
  };

  public shared ({ caller }) func addAIMessage(projectId : Text, role : Text, content : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add AI messages");
    };
    let userProjects = getEmptyProjectMapForUser(caller);
    switch (userProjects.get(projectId)) {
      case (null) { false };
      case (?project) {
        let message : AIMessage = { role; content; timestamp = Time.now() };
        project.aiHistory.add(message);
        userProjects.add(projectId, project);
        projects.add(caller, userProjects);
        true;
      };
    };
  };

  public query ({ caller }) func getAIHistory(projectId : Text) : async [AIMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get AI history");
    };
    switch (getEmptyProjectMapForUser(caller).get(projectId)) {
      case (null) { [] };
      case (?project) { project.aiHistory.toArray() };
    };
  };
};
