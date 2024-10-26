import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Header from './components/Header';
import FoodSpotList from './components/FoodSpotList';
import { FoodSpot } from './types';
import { MapPin, Loader } from 'lucide-react';

function App() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [foodSpots, setFoodSpots] = useState<FoodSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setLoading(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchFoodSpots = async () => {
      if (userLocation) {
        setLoading(true);
        const [lon, lat] = userLocation;
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="restaurant"](around:2000,${lat},${lon}););out;`);
        const data = await response.json();
        const spots: FoodSpot[] = data.elements
          .map((item: any, index: number) => ({
            id: item.id,
            name: item.tags.name || 'Unnamed Restaurant',
            type: item.tags.cuisine || 'Restaurant',
            coordinates: [item.lon, item.lat],
            address: item.tags['addr:street'] ? `${item.tags['addr:housenumber'] || ''} ${item.tags['addr:street']}` : 'Address not available',
            image: `https://source.unsplash.com/400x300/?restaurant,food&sig=${index}`,
            distance: calculateDistance(lat, lon, item.lat, item.lon)
          }))
          .sort((a: FoodSpot, b: FoodSpot) => a.distance - b.distance)
          .slice(0, 10);
        setFoodSpots(spots);
        setLoading(false);
      }
    };

    fetchFoodSpots();
  }, [userLocation]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSelectSpot = (spot: FoodSpot) => {
    setSelectedSpot(spot);
    setDirections(null); // Reset directions when a new spot is selected
  };

  const handleDirectionsFound = (distance: number, duration: number) => {
    setDirections({
      distance: `${(distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(duration / 60)} minutes`
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          <h2 className="text-2xl font-bold mb-4">Nearby Food Spots</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="animate-spin text-green-500 mr-2" />
              <p className="text-green-700">Finding delicious spots...</p>
            </div>
          ) : userLocation ? (
            <>
              <FoodSpotList 
                foodSpots={foodSpots} 
                onSelectSpot={handleSelectSpot} 
                selectedSpot={selectedSpot}
                directions={directions}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-32 bg-yellow-100 rounded-lg">
              <MapPin className="text-yellow-500 mr-2" />
              <p className="text-yellow-700">Unable to get your location</p>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 h-[calc(100vh-4rem)]">
          <Map 
            userLocation={userLocation} 
            foodSpots={foodSpots} 
            selectedSpot={selectedSpot} 
            onDirectionsFound={handleDirectionsFound}
          />
        </div>
      </main>
    </div>
  );
}

export default App;