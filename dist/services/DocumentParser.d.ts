/**
 * Document Parser - Handles product.md parsing and validation
 */
import { ProductDocument } from '../models';
export declare class DocumentParseError extends Error {
    line?: number | undefined;
    column?: number | undefined;
    constructor(message: string, line?: number | undefined, column?: number | undefined);
}
export declare class DocumentParser {
    private ajv;
    private schema;
    constructor();
    parseProductDocument(filePath: string): Promise<ProductDocument>;
    private parseMarkdownToJson;
    private addEntryToDocument;
    private normalizeSlangEntry;
    private normalizeCulturalContext;
    private normalizeSpeakerProfile;
    private normalizeLocationGuide;
    private normalizeGeneralGuidance;
    private validateDocument;
    private createProductDocumentSchema;
}
//# sourceMappingURL=DocumentParser.d.ts.map