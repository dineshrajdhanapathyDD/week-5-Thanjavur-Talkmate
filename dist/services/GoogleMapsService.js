"use strict";
/**
 * Google Maps Service - Provides nearby places and traffic information
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleMapsService = void 0;
class GoogleMapsService {
    constructor(apiKey) {
        this.templeLocation = {
            lat: 10.7825,
            lng: 79.1317,
            name: 'Brihadeeswarar Temple'
        };
        this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('Google Maps API key not configured. Maps features will be limited.');
        }
    }
    async getNearbyTouristAttractions(radius = 2000) {
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
            const data = await response.json();
            if (data.status !== 'OK') {
                console.warn('Google Places API error:', data.status);
                return this.getFallbackAttractions();
            }
            return data.results.slice(0, 8).map((place) => ({
                name: place.name,
                type: this.categorizePlace(place.types),
                rating: place.rating,
                distance: this.calculateDistance(place.geometry.location),
                walkingTime: this.estimateWalkingTime(place.geometry.location),
                address: place.vicinity,
                isOpen: place.opening_hours?.open_now,
                photoUrl: place.photos?.[0] ? this.getPhotoUrl(place.photos[0].photo_reference) : undefined
            }));
        }
        catch (error) {
            console.error('Error fetching nearby places:', error);
            return this.getFallbackAttractions();
        }
    }
    async getNearbyRestaurants() {
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
            const data = await response.json();
            if (data.status !== 'OK') {
                return this.getFallbackRestaurants();
            }
            return data.results.slice(0, 6).map((place) => ({
                name: place.name,
                type: 'Restaurant',
                rating: place.rating,
                distance: this.calculateDistance(place.geometry.location),
                walkingTime: this.estimateWalkingTime(place.geometry.location),
                address: place.vicinity,
                isOpen: place.opening_hours?.open_now
            }));
        }
        catch (error) {
            console.error('Error fetching restaurants:', error);
            return this.getFallbackRestaurants();
        }
    }
    async getTrafficToTemple(fromLocation) {
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
            const data = await response.json();
            if (data.status !== 'OK' || !data.routes.length) {
                return this.getFallbackTraffic();
            }
            const route = data.routes[0];
            const leg = route.legs[0];
            return {
                currentCondition: this.assessTrafficCondition(leg.duration_in_traffic?.value, leg.duration.value),
                estimatedTime: leg.duration_in_traffic?.text || leg.duration.text,
                bestRoute: route.summary,
                alternativeRoutes: data.routes.slice(1, 3).map((r) => r.summary)
            };
        }
        catch (error) {
            console.error('Error fetching traffic info:', error);
            return this.getFallbackTraffic();
        }
    }
    getDirectionsUrl(destination) {
        const dest = destination || `${this.templeLocation.lat},${this.templeLocation.lng}`;
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
    }
    calculateDistance(location) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(location.lat - this.templeLocation.lat);
        const dLng = this.deg2rad(location.lng - this.templeLocation.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(this.templeLocation.lat)) * Math.cos(this.deg2rad(location.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        }
        return `${distance.toFixed(1)}km`;
    }
    estimateWalkingTime(location) {
        const distance = parseFloat(this.calculateDistance(location));
        const walkingSpeed = 5; // km/h
        const timeInHours = distance / walkingSpeed;
        const timeInMinutes = Math.round(timeInHours * 60);
        if (timeInMinutes < 60) {
            return `${timeInMinutes} min walk`;
        }
        return `${Math.round(timeInHours)} hr walk`;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    categorizePlace(types) {
        const typeMap = {
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
    assessTrafficCondition(trafficTime, normalTime) {
        if (!trafficTime || !normalTime)
            return 'moderate';
        const ratio = trafficTime / normalTime;
        if (ratio < 1.2)
            return 'light';
        if (ratio < 1.5)
            return 'moderate';
        return 'heavy';
    }
    getPhotoUrl(photoReference) {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${this.apiKey}`;
    }
    getFallbackAttractions() {
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
    getFallbackRestaurants() {
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
    getFallbackTraffic() {
        return {
            currentCondition: 'moderate',
            estimatedTime: '15-20 minutes',
            bestRoute: 'Via Main Road',
            alternativeRoutes: ['Via Palace Road', 'Via Gandhi Road']
        };
    }
}
exports.GoogleMapsService = GoogleMapsService;
//# sourceMappingURL=GoogleMapsService.js.map