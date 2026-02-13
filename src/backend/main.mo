import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {
  public type UserProfile = {
    name : Text;
  };

  type AuthToken = Text;
  type Password = Text;
  type Timestamp = Int;
  type Email = Text;

  type Session = {
    token : AuthToken;
    created : Timestamp;
    lastAccessed : Timestamp;
    expiration : Timestamp;
  };

  public type AuthenticatedPrincipal = {
    #internetIdentity : Principal;
    #emailPassword : Email;
  };

  public type Credential = {
    principal : AuthenticatedPrincipal;
    passwordHash : Text;
    role : AccessControl.UserRole;
    session : ?Session;
  };

  let credentials = Map.empty<Email, Credential>();
  let emailToPrincipal = Map.empty<Email, Principal>();

  // Full authorization integration
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  let userProfiles = Map.empty<Principal, UserProfile>();

  /// Email/Password support
  func findCredential(email : ?Email, password : ?Password) : ?Credential {
    switch (email, password) {
      case (?e, ?p) {
        switch (credentials.get(e)) {
          case (?cred) {
            // Simple password check (INSECURE - for demo only)
            let expectedHash = e # ":" # p # ":hash";
            if (cred.passwordHash == expectedHash) {
              ?cred;
            } else {
              null;
            };
          };
          case null { null };
        };
      };
      case (_) { null };
    };
  };

  func generatePrincipalForEmail(email : Text) : Principal {
    // Generate a deterministic principal from email (INSECURE - for demo only)
    // In production, use proper principal management
    switch (emailToPrincipal.get(email)) {
      case (?p) { p };
      case null {
        // Create a new principal (this is a simplified approach)
        let p = Principal.fromText("2vxsx-fae"); // Placeholder
        emailToPrincipal.add(email, p);
        p;
      };
    };
  };

  // This is EXPERIMENTAL and just for demonstration purposes!
  // Do NOT use in production - THIS IS FULLY INSECURE, not even persistent!
  public shared ({ caller }) func signup(email : Text, password : Text) : async Bool {
    // Check if email already exists
    switch (credentials.get(email)) {
      case (?_) { return false }; // Email already registered
      case null {};
    };

    let passwordHash = email # ":" # password # ":hash";
    let userPrincipal = generatePrincipalForEmail(email);

    let cred : Credential = {
      principal = #emailPassword email;
      passwordHash;
      role = #user;
      session = null;
    };

    credentials.add(email, cred);

    // Register user in access control system with #user role
    // Note: We use the generated principal for the access control system
    AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);

    true;
  };

  // This is EXPERIMENTAL and just for demonstration purposes!
  // Do NOT use in production - THIS IS FULLY INSECURE, not even persistent!
  // Returns the (crypto-insecure) machine-generated token
  public shared ({ caller }) func login(email : Text, password : Text) : async ?Text {
    switch (findCredential(?email, ?password)) {
      case (?cred) {
        let session = {
          token = email # ":token:" # Int.toText(Time.now());
          created = Time.now();
          lastAccessed = Time.now();
          expiration = Time.now() + 3_600_000_000_000; // 1 hour
        };
        credentials.add(email, { cred with session = ?session });
        ?session.token;
      };
      case (_) { null };
    };
  };

  public query ({ caller }) func validateSession(token : Text) : async Bool {
    // Parse token to extract email
    let parts = token.split(#char(':'));
    let partsArray = parts.toArray();

    if (partsArray.size() < 3) {
      return false;
    };

    let email = partsArray[0];

    switch (credentials.get(email)) {
      case (?cred) {
        switch (cred.session) {
          case (?session) {
            if (session.token == token and Time.now() < session.expiration) {
              true;
            } else {
              false;
            };
          };
          case null { false };
        };
      };
      case null { false };
    };
  };

  // Terminate the session.
  public shared ({ caller }) func logout(token : Text) : async Bool {
    // Parse token to extract email
    let parts = token.split(#char(':'));
    let partsArray = parts.toArray();

    if (partsArray.size() < 3) {
      return false;
    };

    let email = partsArray[0];

    switch (credentials.get(email)) {
      case (?cred) {
        // Clear session but keep credential
        credentials.add(email, { cred with session = null });
        true;
      };
      case null { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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
};
