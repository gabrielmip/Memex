export interface Annotation {
    pageTitle: string
    pageUrl: string
    body: string
    selector: object
    createdWhen?: Date
    lastEdited?: Date
    url?: string
    comment?: string
}

export interface AnnotationRequest {
    memexLinkOrigin: string
    // urlWithoutProtocol: string
    annotationId: string
    tabId: string
}

interface StoredAnnotationRequest extends AnnotationRequest {
    annotationPromise: Promise<Annotation>
}

export interface StoredAnnotationRequestMap {
    [tabId: string]: StoredAnnotationRequest
}

export type AnnotationSender = (
    { annotation, tabId }: { annotation: Annotation; tabId: number },
) => void

export interface SearchParams {
    terms?: string[]
    tags?: string[]
    domains?: string[]
    startDate?: Date | number
    endDate?: Date | number
    /** If defined, confines search to a particular page. */
    url?: string
    limit?: number
    /** Denotes whether or not to limit search to highlighted text. */
    highlightsOnly?: boolean
}

export interface UrlFilters {
    tagUrls?: Set<string>
    domainUrls?: Set<string>
}
