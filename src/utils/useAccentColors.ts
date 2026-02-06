import { useUserStore } from '../store/userStore';

export const useAccentColors = () => {
  const { profile } = useUserStore();
  const color = profile.favoriteColor || 'purple';

  const getColorClasses = (colorName: string) => {
    const colorMap: Record<string, {
      bgPrimary: string;
      bgPrimaryHover: string;
      bgSecondary: string;
      bgSecondaryHover: string;
      bgLight: string;
      bgLightHover: string;
      textPrimary: string;
      textSecondary: string;
      textLight: string;
      borderPrimary: string;
      borderSecondary: string;
      borderFocus: string;
      gradient: string;
      gradientLight: string;
      ring: string;
      ringOffset: string;
      buttonPrimary: string;
      buttonSecondary: string;
    }> = {
      purple: {
        bgPrimary: 'bg-purple-500',
        bgPrimaryHover: 'hover:bg-purple-400',
        bgSecondary: 'bg-purple-600',
        bgSecondaryHover: 'hover:bg-purple-700',
        bgLight: 'bg-purple-300',
        bgLightHover: 'hover:bg-purple-200',
        textPrimary: 'text-purple-400',
        textSecondary: 'text-purple-300',
        textLight: 'text-purple-200',
        borderPrimary: 'border-purple-400',
        borderSecondary: 'border-purple-500',
        borderFocus: 'focus:border-purple-400',
        gradient: 'bg-gradient-to-r from-purple-600 to-purple-400',
        gradientLight: 'bg-gradient-to-r from-purple-400 to-purple-300',
        ring: 'ring-purple-400',
        ringOffset: 'ring-offset-purple-500',
        buttonPrimary: 'bg-purple-700 hover:bg-purple-600',
        buttonSecondary: 'bg-purple-600 hover:bg-purple-500',
      },
      green: {
        bgPrimary: 'bg-green-500',
        bgPrimaryHover: 'hover:bg-green-400',
        bgSecondary: 'bg-green-600',
        bgSecondaryHover: 'hover:bg-green-700',
        bgLight: 'bg-green-300',
        bgLightHover: 'hover:bg-green-200',
        textPrimary: 'text-green-400',
        textSecondary: 'text-green-300',
        textLight: 'text-green-200',
        borderPrimary: 'border-green-400',
        borderSecondary: 'border-green-500',
        borderFocus: 'focus:border-green-400',
        gradient: 'bg-gradient-to-r from-green-600 to-green-400',
        gradientLight: 'bg-gradient-to-r from-green-400 to-green-300',
        ring: 'ring-green-400',
        ringOffset: 'ring-offset-green-500',
        buttonPrimary: 'bg-green-600 hover:bg-green-500',
        buttonSecondary: 'bg-green-500 hover:bg-green-400',
      },
      red: {
        bgPrimary: 'bg-red-500',
        bgPrimaryHover: 'hover:bg-red-400',
        bgSecondary: 'bg-red-600',
        bgSecondaryHover: 'hover:bg-red-700',
        bgLight: 'bg-red-300',
        bgLightHover: 'hover:bg-red-200',
        textPrimary: 'text-red-400',
        textSecondary: 'text-red-300',
        textLight: 'text-red-200',
        borderPrimary: 'border-red-400',
        borderSecondary: 'border-red-500',
        borderFocus: 'focus:border-red-400',
        gradient: 'bg-gradient-to-r from-red-600 to-red-400',
        gradientLight: 'bg-gradient-to-r from-red-400 to-red-300',
        ring: 'ring-red-400',
        ringOffset: 'ring-offset-red-500',
        buttonPrimary: 'bg-red-600 hover:bg-red-500',
        buttonSecondary: 'bg-red-500 hover:bg-red-400',
      },
      blue: {
        bgPrimary: 'bg-blue-500',
        bgPrimaryHover: 'hover:bg-blue-400',
        bgSecondary: 'bg-blue-600',
        bgSecondaryHover: 'hover:bg-blue-700',
        bgLight: 'bg-blue-300',
        bgLightHover: 'hover:bg-blue-200',
        textPrimary: 'text-blue-400',
        textSecondary: 'text-blue-300',
        textLight: 'text-blue-200',
        borderPrimary: 'border-blue-400',
        borderSecondary: 'border-blue-500',
        borderFocus: 'focus:border-blue-400',
        gradient: 'bg-gradient-to-r from-blue-600 to-blue-400',
        gradientLight: 'bg-gradient-to-r from-blue-400 to-blue-300',
        ring: 'ring-blue-400',
        ringOffset: 'ring-offset-blue-500',
        buttonPrimary: 'bg-blue-600 hover:bg-blue-500',
        buttonSecondary: 'bg-blue-500 hover:bg-blue-400',
      },
      yellow: {
        bgPrimary: 'bg-yellow-500',
        bgPrimaryHover: 'hover:bg-yellow-400',
        bgSecondary: 'bg-yellow-600',
        bgSecondaryHover: 'hover:bg-yellow-700',
        bgLight: 'bg-yellow-300',
        bgLightHover: 'hover:bg-yellow-200',
        textPrimary: 'text-yellow-400',
        textSecondary: 'text-yellow-300',
        textLight: 'text-yellow-200',
        borderPrimary: 'border-yellow-400',
        borderSecondary: 'border-yellow-500',
        borderFocus: 'focus:border-yellow-400',
        gradient: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
        gradientLight: 'bg-gradient-to-r from-yellow-400 to-yellow-300',
        ring: 'ring-yellow-400',
        ringOffset: 'ring-offset-yellow-500',
        buttonPrimary: 'bg-yellow-600 hover:bg-yellow-500',
        buttonSecondary: 'bg-yellow-500 hover:bg-yellow-400',
      },
      pink: {
        bgPrimary: 'bg-pink-500',
        bgPrimaryHover: 'hover:bg-pink-400',
        bgSecondary: 'bg-pink-600',
        bgSecondaryHover: 'hover:bg-pink-700',
        bgLight: 'bg-pink-300',
        bgLightHover: 'hover:bg-pink-200',
        textPrimary: 'text-pink-400',
        textSecondary: 'text-pink-300',
        textLight: 'text-pink-200',
        borderPrimary: 'border-pink-400',
        borderSecondary: 'border-pink-500',
        borderFocus: 'focus:border-pink-400',
        gradient: 'bg-gradient-to-r from-pink-600 to-pink-400',
        gradientLight: 'bg-gradient-to-r from-pink-400 to-pink-300',
        ring: 'ring-pink-400',
        ringOffset: 'ring-offset-pink-500',
        buttonPrimary: 'bg-pink-600 hover:bg-pink-500',
        buttonSecondary: 'bg-pink-500 hover:bg-pink-400',
      },
      indigo: {
        bgPrimary: 'bg-indigo-500',
        bgPrimaryHover: 'hover:bg-indigo-400',
        bgSecondary: 'bg-indigo-600',
        bgSecondaryHover: 'hover:bg-indigo-700',
        bgLight: 'bg-indigo-300',
        bgLightHover: 'hover:bg-indigo-200',
        textPrimary: 'text-indigo-400',
        textSecondary: 'text-indigo-300',
        textLight: 'text-indigo-200',
        borderPrimary: 'border-indigo-400',
        borderSecondary: 'border-indigo-500',
        borderFocus: 'focus:border-indigo-400',
        gradient: 'bg-gradient-to-r from-indigo-600 to-indigo-400',
        gradientLight: 'bg-gradient-to-r from-indigo-400 to-indigo-300',
        ring: 'ring-indigo-400',
        ringOffset: 'ring-offset-indigo-500',
        buttonPrimary: 'bg-indigo-600 hover:bg-indigo-500',
        buttonSecondary: 'bg-indigo-500 hover:bg-indigo-400',
      },
    };

    return colorMap[colorName] || colorMap.purple;
  };

  const colorClasses = getColorClasses(color);

  return {
    ...colorClasses,
    // Raw color name for custom usage
    color,
  };
};