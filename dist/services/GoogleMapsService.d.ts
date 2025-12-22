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
export declare class GoogleMapsService {
    private apiKey;
    private templeLocation;
    constructor(apiKey?: string);
    getNearbyTouristAttractions(radius?: number): Promise<NearbyPlace[]>;
    getNearbyRestaurants(): Promise<NearbyPlace[]>;
    getTrafficToTemple(fromLocation: string): Promise<TrafficInfo>;
    getDirectionsUrl(destination?: string): string;
    private calculateDistance;
    private estimateWalkingTime;
    private deg2rad;
    private categorizePlace;
    private assessTrafficCondition;
    private getPhotoUrl;
    private getFallbackAttractions;
    private getFallbackRestaurants;
    private getFallbackTraffic;
}
//# sourceMappingURL=GoogleMapsService.d.ts.map