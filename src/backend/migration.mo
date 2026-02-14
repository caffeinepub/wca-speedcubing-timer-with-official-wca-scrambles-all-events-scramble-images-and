import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    wcaId : ?Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    userCredentials : Map.Map<Principal, { password : Text }>;
    userEmails : Map.Map<Text, Principal>;
    sessions : Map.Map<Principal, Principal>;
    userIdCounter : Nat;
  };

  type NewUserProfile = {
    name : Text;
    wcaId : ?Text;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    { userProfiles = old.userProfiles };
  };
};
