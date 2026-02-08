import React, { useState } from 'react';
import { UserIcon, EnvelopeIcon, CalendarIcon, MapPinIcon, PencilIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useUserStore } from '../store/userStore';
import { useAccentColors } from '../utils/useAccentColors';

export const Profile: React.FC = () => {
  const { profile, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const accentColors = useAccentColors();
  const gradientPattern = accentColors.gradient;

  const colors = [
    "purple",
    "green", 
    "red",
    "blue",
    "yellow",
    "pink",
    "indigo"
  ]

  const handleSave = () => {
    updateProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-gray-600 border-opacity-30">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-4xl font-bold text-white ${accentColors.gradientLight} bg-clip-text text-transparent`}>
              Profile
            </h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors duration-200 font-semibold`}
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${gradientPattern}`}>
              <UserIcon className="h-12 w-12 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className={`${accentColors.textSecondary} font-medium text-white`}>@{profile.username}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Username */}
            <div className="flex items-center gap-4">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Username</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.username}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 ${accentColors.borderFocus} focus:outline-none`}
                  />
                ) : (
                  <p className="text-white">{profile.username}</p>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-sm text-gray-400">FN</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">First Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.firstName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 ${accentColors.borderFocus} focus:outline-none`}
                    />
                  ) : (
                    <p className="text-white">{profile.firstName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <span className="text-sm text-gray-400">LN</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">Last Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.lastName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 ${accentColors.borderFocus} focus:outline-none`}
                    />
                  ) : (
                    <p className="text-white">{profile.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 ${accentColors.borderFocus} focus:outline-none`}
                  />
                ) : (
                  <p className="text-white">{profile.email}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Location</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 ${accentColors.borderFocus} focus:outline-none`}
                  />
                ) : (
                  <p className="text-white">{profile.location}</p>
                )}
              </div>
            </div>

            {/* Preferred Color */}
            <div className="flex items-center gap-4">
                <Cog6ToothIcon className="h-5 w-5 text-gray-400"/>
                <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Color Theme</p>
                {isEditing ? (
                  <select
                    value={editedProfile.favoriteColor}
                    onChange={(e) => setEditedProfile({ ...editedProfile, favoriteColor: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 ${accentColors.borderFocus} focus:outline-none`}
                  >
                    {colors.map(color => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white">{profile.favoriteColor}</p>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="flex items-start gap-4">
              <div className="w-5 h-5 flex items-center justify-center mt-6">
                <span className="text-sm text-gray-400">Bio</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">About</p>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-400 focus:outline-none resize-none"
                  />
                ) : (
                  <p className="text-white whitespace-pre-wrap">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-4">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Member Since</p>
                <p className="text-white">{formatDate(profile.joinDate)}</p>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className={`flex-1 px-4 py-2 ${accentColors.bgPrimary} text-white rounded-lg ${accentColors.bgPrimaryHover} transition-colors duration-200 font-semibold`}
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200 font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};