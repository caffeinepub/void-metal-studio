import Map "mo:core/Map";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  type OldActor = {
    bans : Map.Map<Principal, Int>;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type AIMessage = {
    role : Text;
    content : Text;
    timestamp : Int;
  };

  type ProjectStage = { #idea; #script; #visuals; #video; #published };

  type StableProject = {
    id : Text;
    title : Text;
    stage : ProjectStage;
    createdAt : Int;
    updatedAt : Int;
    scriptContent : Text;
    designNotes : Text;
    videoNotes : Text;
    aiHistory : List.List<AIMessage>;
  };

  type NewActor = {
    bans : Map.Map<Principal, Int>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    projects : Map.Map<Principal, Map.Map<Text, StableProject>>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      projects = Map.empty<Principal, Map.Map<Text, StableProject>>();
    };
  };
};
