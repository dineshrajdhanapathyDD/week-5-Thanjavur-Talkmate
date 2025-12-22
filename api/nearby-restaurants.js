"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const GoogleMapsService_1 = require("../src/services/GoogleMapsService");
let mapsService = null;
function initializeMapsService() {
    if (!mapsService) {
        mapsService = new GoogleMapsService_1.GoogleMapsService();
    }
    return mapsService;
}
async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const service = initializeMapsService();
        const restaurants = await service.getNearbyRestaurants();
        res.status(200).json({ restaurants });
    }
    catch (error) {
        console.error('Error fetching nearby restaurants:', error);
        res.status(500).json({ error: 'Failed to fetch nearby restaurants' });
    }
}
//# sourceMappingURL=nearby-restaurants.js.map