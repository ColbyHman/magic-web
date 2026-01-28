import React from 'react';
import { Zone } from '../types';
import { ZoneComponent } from './Zone';

export const Battlefield: React.FC = React.memo(() => {
  return (
    <div className="flex flex-col h-screen">
      {/* Top area - Opponent zones */}
      <div className="h-1/3 p-4">
        <div className="flex gap-4 h-full">
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
      </div>

      {/* Middle divider */}
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-600 to-transparent opacity-50 flex-shrink-0" />

      {/* Main game area - Player battlefield, lands, and hand */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        {/* Player Battlefield - takes most space */}
        <div className="flex-1 min-h-0 mb-3">
          <ZoneComponent 
            zone={Zone.BATTLEFIELD} 
            title="Battlefield"
            id="player-battlefield"
          />
        </div>
        
        {/* Player Lands - dedicated zone */}
        <div className="h-16 mb-3 flex-shrink-0">
          <ZoneComponent 
            zone={Zone.LANDS} 
            title="Lands"
            id="player-lands"
          />
        </div>
        
        {/* Player Hand - at bottom */}
        <div className="h-20 flex-shrink-0">
          <ZoneComponent 
            zone={Zone.HAND} 
            title="Hand"
          />
        </div>
      </div>
    </div>
  );
});