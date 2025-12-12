import express from "express";
import { requireAuth } from '../middleware/requireAuth.js';
import { getScenarios, getScenarioByTitle, completeScenarioByTitle } from "../services/scenarioService.js";
export const router = express.Router();
/**
 * GET /
 * Retrieve a list of all scenarios with optional enrichment:
 * - `previouslyComplete` flag indicates if the currently logged-in user has completed the scenario.
 *
 * Public endpoint; enrichment only applies if user is authenticated.
 */
router.get('/', async (req, res) => {
    try {
        const uid = req.user?.uid; // undefined if not logged in
        const response = await getScenarios(uid);
        return res.json(response);
    }
    catch (err) {
        return res.status(500).send('Internal server error');
    }
});
/**
 * GET /:title
 * Retrieve full scenario details by title.
 *
 * Public endpoint.
 *
 * @param {string} title - Title of the scenario
 */
router.get('/:title', async (req, res) => {
    try {
        const { title } = req.params;
        if (!title)
            return res.status(400).send('No Title Provided.');
        const scenario = await getScenarioByTitle(title);
        if (!scenario) {
            return res.status(404).send('Scenario not found');
        }
        return res.json(scenario);
    }
    catch (err) {
        return res.status(500).send('Internal server error');
    }
});
/**
 * POST /:title/complete
 * Mark a scenario as completed by the authenticated user.
 *
 * Requires authentication.
 *
 * @param {string} title - Title of the scenario to mark as completed
 */
router.post('/:title/complete', requireAuth, async (req, res) => {
    try {
        const { title } = req.params;
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).send('Unauthorized. User not logged in.');
        if (!title)
            return res.status(400).send('No Title Provided.');
        const responseMessage = await completeScenarioByTitle(uid, title);
        return res.status(200).send(responseMessage);
    }
    catch (err) {
        return res.status(500).send('Internal server error');
    }
});
export default router;
//# sourceMappingURL=scenarioRoutes.js.map