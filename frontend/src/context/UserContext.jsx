import { createContext, useContext, useState } from "react";

const USERS = [
  { id: 1, name: "Hadi", roles: ["Requester"] },
  { id: 2, name: "Haneen", roles: ["Approver"] },
  { id: 3, name: "Lama", roles: ["Approver", "Requester"] },
];

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USERS[0]);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users: USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
