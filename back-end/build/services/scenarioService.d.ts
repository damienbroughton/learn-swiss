/**
 * GET /
 * Retrieve a list of all scenarios with optional enrichment:
 * - `previouslyComplete` flag indicates if the currently logged-in user has completed the scenario.
 *
 * Public endpoint; enrichment only applies if user is authenticated.
 */
export declare function getScenarios(uid: string | undefined): Promise<{
    title: any;
    image: any;
    previouslyComplete: any;
}[]>;
/**
 * Retrieve full scenario details by title.
 */
export declare function getScenarioByTitle(title: string): Promise<import("mongodb").WithId<import("bson").Document> | null>;
/**
 * Mark a scenario as completed by the authenticated user.
 */
export declare function completeScenarioByTitle(uid: string, title: string): Promise<"OK" | "OK - Previously Completed">;
//# sourceMappingURL=scenarioService.d.ts.map