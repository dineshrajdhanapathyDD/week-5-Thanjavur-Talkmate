import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleMapsService } from '../src/services/GoogleMapsService';

let mapsService: GoogleMapsService | null = null;

function initializeMapsService() {
  if (!mapsService) {
    mapsService = new GoogleMapsService();
  }
  return mapsService;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const fromLocation = (req.query.from as string) || 'Thanjavur Railway Station';

    const traffic = await service.getTrafficToTemple(fromLocation);
    const directionsUrl = service.getDirectionsUrl();
    
    res.status(200).json({ traffic, directionsUrl });

  } catch (error) {
    console.error('Error fetching traffic info:', error);
    res.status(500).json({ error: 'Failed to fetch traffic information' });
  }
}