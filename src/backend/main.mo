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

  public type AuthToken = Text;
  public type Password = Text;
  public type Timestamp = Int;
  public type Email = Text;

  public type Session = {
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
  let tokenToEmail = Map.empty<AuthToken, Email>();

  // Full authorization integration
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Result and Response Types
  public type SignupResult = {
    #success : {
      message : Text;
      sessionToken : Text;
      session : ?Session;
      user : AuthenticatedPrincipal;
    };
    #failure : { message : Text };
  };

  public type LoginResult = {
    #success : {
      message : Text;
      sessionToken : Text;
      session : ?Session;
      user : AuthenticatedPrincipal;
    };
    #failure : { message : Text };
  };

  public type SessionValidationResult = {
    isValid : Bool;
    message : Text;
    user : ?AuthenticatedPrincipal;
    session : ?Session;
  };

  public type LogoutResult = {
    #success : { message : Text };
    #failure : { message : Text };
  };

  // Helper Functions
  func findCredential(email : ?Email, password : ?Password) : ?Credential {
    switch (email, password) {
      case (?e, ?p) {
        switch (credentials.get(e)) {
          case (?cred) {
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

  func generateSessionToken(email : Email) : Text {
    email # ":token:" # Int.toText(Time.now());
  };

  func generatePrincipalForEmail(email : Text) : Principal {
    switch (emailToPrincipal.get(email)) {
      case (?p) { p };
      case null {
        let p = Principal.fromText("2vxsx-fae"); // Placeholder
        emailToPrincipal.add(email, p);
        p;
      };
    };
  };

  // Auth API
  public shared ({ caller }) func signup(email : Text, password : Text) : async SignupResult {
    // Signup is intentionally public - anyone can create an account
    switch (credentials.get(email)) {
      case (?_) {
        return #failure { message = "Email already registered" };
      };
      case null {};
    };

    let passwordHash = email # ":" # password # ":hash";
    let userPrincipal = generatePrincipalForEmail(email);
    let authPrincipal : AuthenticatedPrincipal = #emailPassword email;

    let cred : Credential = {
      principal = authPrincipal;
      passwordHash;
      role = #user;
      session = null;
    };

    // Create a session on signup
    let session : Session = {
      token = generateSessionToken(email);
      created = Time.now();
      lastAccessed = Time.now();
      expiration = Time.now() + 3_600_000_000_000; // 1 hour
    };

    credentials.add(email, { cred with session = ?session });
    tokenToEmail.add(session.token, email);

    AccessControl.assignRole(accessControlState, caller, userPrincipal, #user);

    #success {
      message = "Signup successful";
      sessionToken = session.token;
      session = ?session;
      user = authPrincipal;
    };
  };

  public shared ({ caller }) func login(email : Text, password : Text) : async LoginResult {
    // Login is intentionally public - users need to authenticate
    switch (findCredential(?email, ?password)) {
      case (?cred) {
        let session = {
          token = generateSessionToken(email);
          created = Time.now();
          lastAccessed = Time.now();
          expiration = Time.now() + 3_600_000_000_000; // 1 hour
        };
        credentials.add(email, { cred with session = ?session });
        tokenToEmail.add(session.token, email);

        #success {
          message = "Login successful";
          sessionToken = session.token;
          session = ?session;
          user = cred.principal;
        };
      };
      case (_) {
        #failure { message = "Invalid email or password" };
      };
    };
  };

  public query ({ caller }) func validateSession(token : Text) : async SessionValidationResult {
    // Authorization: Only authenticated users (not guests) can validate sessions
    // This prevents anonymous callers from probing for valid sessions
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return {
        isValid = false;
        message = "Unauthorized: Only authenticated users can validate sessions";
        user = null;
        session = null;
      };
    };

    let parts = token.split(#char(':'));
    let partsArray = parts.toArray();

    if (partsArray.size() < 3) {
      return {
        isValid = false;
        message = "Invalid session token format";
        user = null;
        session = null;
      };
    };

    let email = partsArray[0];

    switch (credentials.get(email)) {
      case (?cred) {
        switch (cred.session) {
          case (?session) {
            if (session.token == token and Time.now() < session.expiration) {
              return {
                isValid = true;
                message = "Valid session";
                user = ?cred.principal;
                session = ?session;
              };
            } else {
              return {
                isValid = false;
                message = "Session expired or invalid";
                user = null;
                session = null;
              };
            };
          };
          case null {
            return {
              isValid = false;
              message = "No active session found";
              user = null;
              session = null;
            };
          };
        };
      };
      case null {
        return {
          isValid = false;
          message = "Invalid session or token";
          user = null;
          session = null;
        };
      };
    };
  };

  public shared ({ caller }) func logout(token : Text) : async LogoutResult {
    // Authorization: Verify the caller owns the session being logged out
    // Extract email from token to find the associated credential
    switch (tokenToEmail.get(token)) {
      case (?email) {
        switch (credentials.get(email)) {
          case (?cred) {
            // Verify the session exists and matches the token
            switch (cred.session) {
              case (?session) {
                if (session.token != token) {
                  return #failure { message = "Token mismatch" };
                };

                // Get the principal associated with this email credential
                let credentialPrincipal = generatePrincipalForEmail(email);

                // Authorization check: Only the session owner or an admin can logout
                if (caller != credentialPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
                  return #failure { message = "Unauthorized: Can only logout your own session" };
                };

                // Clear the session
                credentials.add(email, { cred with session = null });
                tokenToEmail.remove(token);
                #success { message = "Logout successful" };
              };
              case null {
                #failure { message = "No active session found" };
              };
            };
          };
          case null {
            #failure { message = "Invalid token: no associated user found" };
          };
        };
      };
      case null {
        #failure { message = "Invalid token format" };
      };
    };
  };

  // User Profile Management
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
