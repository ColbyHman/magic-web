import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Phase, Step } from '../types';
import { useAccentColors } from '../utils/useAccentColors';

const phaseNames: Record<Phase, string> = {
  beginning: 'Beginning',
  main1: 'Main Phase 1',
  combat: 'Combat',
  main2: 'Main Phase 2',
  ending: 'Ending',
};

const stepNames: Record<Step, string> = {
  untap: 'Untap',
  upkeep: 'Upkeep',
  draw: 'Draw',
  main: 'Main',
  begin_combat: 'Beginning of Combat',
  declare_attackers: 'Declare Attackers',
  declare_blockers: 'Declare Blockers',
  combat_damage: 'Combat Damage',
  end_combat: 'End of Combat',
  end_step: 'End Step',
  cleanup: 'Cleanup',
};

const phaseSteps: Record<Phase, Step[]> = {
  beginning: ['untap', 'upkeep', 'draw'],
  main1: ['main'],
  combat: ['begin_combat', 'declare_attackers', 'declare_blockers', 'combat_damage', 'end_combat'],
  main2: ['main'],
  ending: ['end_step', 'cleanup'],
};

export const PhaseIndicator: React.FC = React.memo(() => {
  const currentPhase = useGameStore((state) => state.currentPhase);
  const currentStep = useGameStore((state) => state.currentStep);
  const advanceStep = useGameStore((state) => state.advanceStep);
  const skipToEnd = useGameStore((state) => state.skipToEnd);
  const passToNextTurn = useGameStore((state) => state.passToNextTurn);
  const accentColors = useAccentColors();

  const [isExpanded, setIsExpanded] = React.useState(false);

  const showEndButton = currentPhase === 'main1';
  const showPassButton = currentPhase === 'ending' && currentStep === 'cleanup';

  // Determine the next step button text
  const getNextStepText = (): string => {
    if (showPassButton) return 'Pass';
    
    const nextStepMap: Record<string, string> = {
      // Beginning Phase
      'beginning-untap': 'Upkeep',
      'beginning-upkeep': 'Draw',
      'beginning-draw': 'Main Phase 1',
      // Main Phase 1
      'main1-main': 'Enter Combat',
      // Combat Phase
      'combat-begin_combat': 'Declare Attackers',
      'combat-declare_attackers': 'Declare Blockers',
      'combat-declare_blockers': 'Combat Damage',
      'combat-combat_damage': 'End Combat',
      'combat-end_combat': 'Main Phase 2',
      // Main Phase 2
      'main2-main': 'End Step',
      // Ending Phase
      'ending-end_step': 'Cleanup',
      'ending-cleanup': 'Pass',
    };

    const key = `${currentPhase}-${currentStep}`;
    return nextStepMap[key] || 'Next Step';
  };

  const nextStepButtonText = getNextStepText();

  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <div className="bg-gradient-to-r from-gray-900 via-green-900 to-gray-900 border-2 border-yellow-600 border-opacity-60 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-90">
        {/* Collapsed View */}
        <div className="px-6 py-3 flex items-center gap-4">
          <div
            className="cursor-pointer select-none flex items-center gap-4 flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="text-yellow-400 font-bold text-lg">
              {phaseNames[currentPhase]}
            </div>
            <div className="text-white text-sm">
              {stepNames[currentStep]}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-yellow-400 text-xl"
            >
              ▼
            </motion.div>
          </div>

          {/* Action Buttons - Always Visible */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPassButton ? passToNextTurn() : advanceStep();
              }}
              className={`${
                showPassButton 
                  ? accentColors.buttonPrimary
                  : 'bg-green-700 hover:bg-green-600'
              } text-white font-bold py-2 px-4 rounded transition-colors text-sm`}
            >
              {nextStepButtonText}
            </button>

            {showEndButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  skipToEnd();
                }}
                className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
              >
                End
              </button>
            )}
          </div>
        </div>

        {/* Expanded View */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-yellow-600 border-opacity-30"
            >
              <div className="px-6 py-4">
                {/* All Steps for Current Phase */}
                <div className="space-y-1">
                  {phaseSteps[currentPhase].map((step) => (
                    <div
                      key={step}
                      className={`text-sm px-3 py-1 rounded ${
                        step === currentStep
                          ? 'bg-yellow-600 bg-opacity-40 text-white font-bold ring-1 ring-yellow-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {stepNames[step]}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
