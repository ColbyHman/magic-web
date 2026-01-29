import React from 'react';
import { Zone, type BattlefieldProps } from '../types';
import { ZoneComponent } from './Zone';

export const Battlefield: React.FC<BattlefieldProps> = React.memo(({ setBattlefieldHover }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 box-border">
      {/* Top area - Opponent zones */}
      <div className="h-[18vh] min-h-[120px] flex gap-4 flex-shrink-0">
          {/* Left column: Graveyard and Exile */}
          <div className="flex flex-col gap-2 w-20 flex-shrink-0">
            <ZoneComponent 
              zone={Zone.GRAVEYARD} 
              title="Graveyard" 
              className="h-24"
              id="opponent-graveyard"
            />
            <ZoneComponent 
              zone={Zone.GRAVEYARD} 
              title="Exile" 
              className="h-20"
              id="exile"
            />
          </div>
          
          {/* Center: Opponent Battlefield */}
          <div className="flex-1 min-w-0">
            <ZoneComponent 
              zone={Zone.OPPONENT_BATTLEFIELD} 
              title="Opponent's Battlefield"
              id="opponent-battlefield"
            />
          </div>
        </div>

      {/* Middle divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50 flex-shrink-0" />

      {/* Main game area - Player battlefield, lands, and hand */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {/* Player Battlefield - takes most space */}
        <div className="flex-1 min-h-0 mb-2 flex items-center justify-center w-full">
          <ZoneComponent 
            zone={Zone.BATTLEFIELD} 
            title="Battlefield"
            id="player-battlefield"
            setBattlefieldHover={setBattlefieldHover}
          />
        </div>
        {/* Player Lands - dedicated zone */}
        <div className="h-[12vh] min-h-[80px] mb-2 flex-shrink-0 flex items-center w-full">
          <ZoneComponent 
            zone={Zone.LANDS} 
            title="Lands"
            id="player-lands"
            className="w-full"
          />
        </div>
        {/* Player Hand - at bottom */}
        <div className="h-[12vh] min-h-[80px] flex-shrink-0 flex items-center w-full">
          <ZoneComponent 
            zone={Zone.HAND} 
            title="Hand"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
});