import React from 'react';
import { Zone, type BattlefieldProps } from '../types';
import { ZoneComponent } from './Zone';

export const Battlefield: React.FC<BattlefieldProps> = React.memo(({ setBattlefieldHover, setHandHover, setLandsHover }) => {
  return (
    <div className="flex flex-col h-full w-full max-w-screen-2xl mx-auto px-6 box-border">
      {/* Top area - Opponent zones */}
      <div className="h-[35vh] min-h-[200px] flex gap-4 flex-shrink-0">
          {/* Left column: Graveyard and Exile */}
          {/* Center: Opponent Battlefield */}
          <div className="flex-1 min-w-0 max-w-6xl mx-auto">
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
        {/* Player Battlefield - slightly smaller */}
        <div className="h-[35vh] min-h-[200px] mb-2 flex items-center justify-center w-full max-w-6xl mx-auto flex-shrink-0">
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
              zone={Zone.GRAVEYARD} 
              title="Graveyard" 
              className="h-24"
              id="opponent-graveyard"
              isDroppable={false}
            />
          <ZoneComponent 
            zone={Zone.LANDS} 
            title="Lands"
            id="player-lands"
            className="w-full"
            setBattlefieldHover={setLandsHover}
          />
        </div>
        {/* Player Hand - at bottom */}
        <div className="h-[20vh] min-h-[150px] flex-shrink-0 w-full">
          <ZoneComponent 
            zone={Zone.HAND} 
            title="Hand"
            className="w-full h-full"
            id="player-hand"
            setBattlefieldHover={setHandHover}
          />
        </div>
        {/* Exile zone */}
        <div className="h-[6vh] min-h-[40px] flex-shrink-0 flex items-center w-full">
          <ZoneComponent 
              zone={Zone.GRAVEYARD} 
              title="Exile" 
              className="h-12"
              id="exile"
              isDroppable={false}
            />
        </div>
      </div>
    </div>
  );
});