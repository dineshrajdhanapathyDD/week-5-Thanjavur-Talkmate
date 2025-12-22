/**
 * Google Maps Service - Provides nearby places and traffic information
 */

export interface NearbyPlace {
  name: string;
  type: string;
  rating?: number;
  distance: string;
  walkingTime: string;
  address: string;
  isOpen?: boolean;
  photoUrl?: string;
}

export interface TrafficInfo {
  currentCondition: 'light' | 'moderate' | 'heavy';
  estimatedTime: string;
  bestRoute: string;
  alternativeRoutes?: string[];
}

export class GoogleMapsService {
  private apiKey: string;
  private templeLocation = {
    lat: 10.7825,
    lng: 79.1317,
    name: 'Brihadeeswarar Temple'
  };

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured. Maps features will be limited.');
    }
  }

  async getNearbyTouristAttractions(radius: number = 2000): Promise<NearbyPlace[]> {
    if (!this.apiKey) {
      return this.getFallbackAttractions();
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${this.templeLocation.lat},${this.templeLocation.lng}&` +
        `radius=${radius}&` +
        `type=tourist_attraction&` +
        `key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status !== 'OK') {
        console.warn('Google Places API error:', data.status);
        return this.getFallbackAttractions();
      }

      return data.results.slice(0, 8).map((place: any) => ({
        name: place.name,
        type: this.categorizePlace(place.types),
        rating: place.rating,
        distance: this.calculateDistance(place.geometry.location),
        walkingTime: this.estimateWalkingTime(place.geometry.location),
        address: place.vicinity,
        isOpen: place.opening_hours?.open_now,
        photoUrl: place.photos?.[0] ? this.getPhotoUrl(place.photos[0].photo_reference) : undefined
      }));

    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return this.getFallbackAttractions();
    }
  }

  async getNearbyRestaurants(): Promise<NearbyPlace[]> {
    if (!this.apiKey) {
      return this.getFallbackRestaurants();
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${this.templeLocation.lat},${this.templeLocation.lng}&` +
        `radius=1000&` +
        `type=restaurant&` +
        `key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status !== 'OK') {
        return this.getFallbackRestaurants();
      }

      return data.results.slice(0, 6).map((place: any) => ({
        name: place.name,
        type: 'Restaurant',
        rating: place.rating,
        distance: this.calculateDistance(place.geometry.location),
        walkingTime: this.estimateWalkingTime(place.geometry.location),
        address: place.vicinity,
        isOpen: place.opening_hours?.open_now
      }));

    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return this.getFallbackRestaurants();
    }
  }

  async getTrafficToTemple(fromLocation: string): Promise<TrafficInfo> {
    if (!this.apiKey) {
      return this.getFallbackTraffic();
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${encodeURIComponent(fromLocation)}&` +
        `destination=${this.templeLocation.lat},${this.templeLocation.lng}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json() as any;

      if (data.status !== 'OK' || !data.routes.length) {
        return this.getFallbackTraffic();
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        currentCondition: this.assessTrafficCondition(leg.duration_in_traffic?.value, leg.duration.value),
        estimatedTime: leg.duration_in_traffic?.text || leg.duration.text,
        bestRoute: route.summary,
        alternativeRoutes: data.routes.slice(1, 3).map((r: any) => r.summary)
      };

    } catch (error) {
      console.error('Error fetching traffic info:', error);
      return this.getFallbackTraffic();
    }
  }

  getDirectionsUrl(destination?: string): string {
    const dest = destination || `${this.templeLocation.lat},${this.templeLocation.lng}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  }

  private calculateDistance(location: { lat: number; lng: number }): string {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(location.lat - this.templeLocation.lat);
    const dLng = this.deg2rad(location.lng - this.templeLocation.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(this.templeLocation.lat)) * Math.cos(this.deg2rad(location.lat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  private estimateWalkingTime(location: { lat: number; lng: number }): string {
    const distance = parseFloat(this.calculateDistance(location));
    const walkingSpeed = 5; // km/h
    const timeInHours = distance / walkingSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} min walk`;
    }
    return `${Math.round(timeInHours)} hr walk`;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private categorizePlace(types: string[]): string {
    const typeMap: Record<string, string> = {
      'tourist_attraction': 'Tourist Attraction',
      'museum': 'Museum',
      'place_of_worship': 'Temple/Religious Site',
      'park': 'Park',
      'shopping_mall': 'Shopping',
      'restaurant': 'Restaurant',
      'lodging': 'Hotel'
    };

    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }
    return 'Place of Interest';
  }

  private assessTrafficCondition(trafficTime?: number, normalTime?: number): 'light' | 'moderate' | 'heavy' {
    if (!trafficTime || !normalTime) return 'moderate';
    
    const ratio = trafficTime / normalTime;
    if (ratio < 1.2) return 'light';
    if (ratio < 1.5) return 'moderate';
    return 'heavy';
  }

  private getPhotoUrl(photoReference: string): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${this.apiKey}`;
  }

  private getFallbackAttractions(): NearbyPlace[] {
    return [
      {
        name: 'Thanjavur Palace',
        type: 'Historical Palace',
        rating: 4.2,
        distance: '1.2km',
        walkingTime: '15 min walk',
        address: 'Palace Road, Thanjavur',
        isOpen: true
      },
      {
        name: 'Saraswathi Mahal Library',
        type: 'Historical Library',
        rating: 4.0,
        distance: '1.1km',
        walkingTime: '14 min walk',
        address: 'Palace Complex, Thanjavur'
      },
      {
        name: 'Art Gallery',
        type: 'Museum',
        rating: 3.8,
        distance: '1.3km',
        walkingTime: '16 min walk',
        address: 'Palace Complex, Thanjavur'
      },
      {
        name: 'Schwartz Church',
        type: 'Historical Church',
        rating: 4.1,
        distance: '800m',
        walkingTime: '10 min walk',
        address: 'Church Street, Thanjavur'
      }
    ];
  }

  private getFallbackRestaurants(): NearbyPlace[] {
    return [
      {
        name: 'Sathars Restaurant',
        type: 'South Indian',
        rating: 4.3,
        distance: '500m',
        walkingTime: '6 min walk',
        address: 'Gandhi Road, Thanjavur',
        isOpen: true
      },
      {
        name: 'Hotel Gnanam',
        type: 'Traditional Tamil',
        rating: 4.0,
        distance: '400m',
        walkingTime: '5 min walk',
        address: 'Near Temple, Thanjavur'
      },
      {
        name: 'Annapoorna Restaurant',
        type: 'Vegetarian',
        rating: 4.2,
        distance: '600m',
        walkingTime: '7 min walk',
        address: 'Main Road, Thanjavur'
      }
    ];
  }

  private getFallbackTraffic(): TrafficInfo {
    return {
      currentCondition: 'moderate',
      estimatedTime: '15-20 minutes',
      bestRoute: 'Via Main Road',
      alternativeRoutes: ['Via Palace Road', 'Via Gandhi Road']
    };
  }
}