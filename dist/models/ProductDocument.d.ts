/**
 * Core data models for the product document structure
 */
export type SpeakerType = 'shopkeeper' | 'auto_driver' | 'temple_staff' | 'elderly_local';
export type LocationType = 'temple_streets' | 'markets' | 'public_areas';
export interface SlangEntry {
    phrase: string;
    tamilScript?: string;
    literalMeaning: string;
    culturalMeaning: string;
    commonContexts: string[];
    speakerTypes: SpeakerType[];
    locations: LocationType[];
    visitorAdvice: string;
}
export interface CulturalContext {
    id: string;
    description: string;
    applicableLocations: LocationType[];
    culturalNorms: string[];
    visitorGuidance: string;
}
export interface SpeakerProfile {
    type: SpeakerType;
    description: string;
    commonPhrases: string[];
    culturalNotes: string[];
    interactionTips: string[];
}
export interface LocationGuide {
    location: LocationType;
    description: string;
    culturalNorms: string[];
    commonSituations: string[];
    visitorTips: string[];
}
export interface GeneralGuidance {
    category: string;
    title: string;
    description: string;
    applicableContexts: string[];
}
export interface ProductDocument {
    slangEntries: SlangEntry[];
    culturalContexts: CulturalContext[];
    speakerProfiles: SpeakerProfile[];
    locationGuides: LocationGuide[];
    generalGuidance: GeneralGuidance[];
    metadata: {
        version: string;
        lastUpdated: string;
        region: string;
        language: string;
    };
}
//# sourceMappingURL=ProductDocument.d.ts.map