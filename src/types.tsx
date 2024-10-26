export interface FoodSpot {
    id: number;
    name: string;
    type: string;
    coordinates: [number, number];
    address: string;
    image: string;
    distance: number;
  }