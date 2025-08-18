export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UserData {
  id: string;
  name: string;
  mobile: string;
  location?: LocationData;
  created_at: string;
}

export interface SignupRequest {
  name: string;
  mobile: string;
  password: string;
  location?: LocationData;
}

export interface LoginRequest {
  mobile: string;
  password: string;
}

// Simple base64 encoding for password
const encodePassword = (password: string): string => {
  return btoa(password);
};

const decodePassword = (encodedPassword: string): string => {
  return atob(encodedPassword);
};

// Local storage helpers
export const authStorage = {
  // Save current user to localStorage
  saveCurrentUser: (user: UserData): void => {
    localStorage.setItem('farmers_app_current_user', JSON.stringify(user));
  },

  // Get current user from localStorage
  getCurrentUser: (): UserData | null => {
    const userData = localStorage.getItem('farmers_app_current_user');
    return userData ? JSON.parse(userData) : null;
  },

  // Remove current user from localStorage
  removeCurrentUser: (): void => {
    localStorage.removeItem('farmers_app_current_user');
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('farmers_app_current_user');
  },

  // Save users list to localStorage
  saveUsers: (users: any[]): void => {
    localStorage.setItem('farmers_app_users', JSON.stringify(users));
  },

  // Get users list from localStorage
  getUsers: (): any[] => {
    const users = localStorage.getItem('farmers_app_users');
    return users ? JSON.parse(users) : [];
  },
};

// Simple authentication functions
export const authApi = {
  // Sign up a new user
  signup: (userData: SignupRequest): UserData => {
    const users = authStorage.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.mobile === userData.mobile);
    if (existingUser) {
      throw new Error('User with this mobile number already exists');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      mobile: userData.mobile,
      password: encodePassword(userData.password), // Base64 encode password
      location: userData.location,
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    authStorage.saveUsers(users);
    
    // Return user data (without password)
    const userResponse: UserData = {
      id: newUser.id,
      name: newUser.name,
      mobile: newUser.mobile,
      location: newUser.location,
      created_at: newUser.created_at
    };
    
    authStorage.saveCurrentUser(userResponse);
    return userResponse;
  },

  // Login user
  login: (loginData: LoginRequest): UserData => {
    const users = authStorage.getUsers();
    
    // Find user by mobile
    const user = users.find(u => u.mobile === loginData.mobile);
    if (!user) {
      throw new Error('Invalid mobile number or password');
    }
    
    // Check password
    const decodedPassword = decodePassword(user.password);
    if (decodedPassword !== loginData.password) {
      throw new Error('Invalid mobile number or password');
    }
    
    // Return user data (without password)
    const userResponse: UserData = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      location: user.location,
      created_at: user.created_at
    };
    
    authStorage.saveCurrentUser(userResponse);
    return userResponse;
  },

  // Logout user
  logout: (): void => {
    authStorage.removeCurrentUser();
  },

  // Get all users (for development/testing)
  getAllUsers: (): UserData[] => {
    const users = authStorage.getUsers();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      location: user.location,
      created_at: user.created_at
    }));
  },

  // Clear all users (for development/testing)
  clearAllUsers: (): void => {
    authStorage.saveUsers([]);
    authStorage.removeCurrentUser();
  },
};
