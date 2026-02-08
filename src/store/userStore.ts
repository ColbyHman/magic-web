import { create } from 'zustand';

export interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  joinDate: string;
  avatar?: string;
  bio?: string;
  location?: string;
  favoriteColor?: string;
}



interface UserStore {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setProfile: (profile: UserProfile) => void;
}

const defaultProfile: UserProfile = {
  username: 'player_one',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  joinDate: new Date().toISOString(),
  avatar: undefined,
  bio: 'Magic: The Gathering enthusiast',
  location: 'Unknown',
  favoriteColor: "purple",
};

export const useUserStore = create<UserStore>((set) => ({
  profile: defaultProfile,

  updateProfile: (updates: Partial<UserProfile>) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
    }));
  },

  setProfile: (profile: UserProfile) => {
    set({ profile });
  },
}));