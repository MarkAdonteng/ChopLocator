import React from 'react';
import { FoodSpot } from '../types';
import { MapPin, Utensils, Navigation } from 'lucide-react';

interface FoodSpotListProps {
  foodSpots: FoodSpot[];
  onSelectSpot: (spot: FoodSpot) => void;
  selectedSpot: FoodSpot | null;
  directions: { distance: string; duration: string } | null;
}

const FoodSpotList: React.FC<FoodSpotListProps> = ({ foodSpots, onSelectSpot, selectedSpot, directions }) => {
  return (
    <ul className="space-y-4">
      {foodSpots.map((spot) => (
        <li 
          key={spot.id} 
          className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:bg-gray-50 transition duration-300 ${selectedSpot?.id === spot.id ? 'border-2 border-green-500' : ''}`} 
          onClick={() => onSelectSpot(spot)}
        >
          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <Utensils className="text-green-600" size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold text-lg">{spot.name}</h3>
              <p className="text-sm text-gray-600">{spot.type}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <MapPin size={16} className="mr-1" />
                <p>{spot.distance.toFixed(2)} miles away</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{spot.address}</p>
              {selectedSpot?.id === spot.id && directions && (
                <div className="mt-2 text-sm text-green-600">
                  <div className="flex items-center">
                    <Navigation size={16} className="mr-1" />
                    <p>{directions.distance} • {directions.duration}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FoodSpotList;