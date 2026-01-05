import { CloudTasksClient } from '@google-cloud/tasks';

/**
 * @file tasks.ts
 * @description Manages Google Cloud Tasks configuration and job enqueuing.
 */

let client: CloudTasksClient | null = null;
let queuePath: string | null = null;
let workerUrl: string | null = null;
let serviceAccountEmail: string | null = null;

/**
 * Initializes the Cloud Tasks configuration.
 */
export async function initTasks(): Promise<void> {
    try {
        const projectId = process.env.GOOGLE_PROJECT_ID || 'your-default-project-id';
        const projectReference = process.env.GOOGLE_PROJECT_REF || 'your-default-project-id';
        const location = process.env.GOOGLE_CLOUD_QUEUE_LOCATION || 'us-central1';
        const queueName = 'job-queue';
        workerUrl = process.env.WORKER_SERVICE_URL || 'job-queue';

        serviceAccountEmail = `${projectId}-compute@developer.gserviceaccount.com`;

        client = new CloudTasksClient();
        queuePath = client.queuePath(projectReference, location, queueName);

        console.log(`[Tasks] Cloud Tasks initialized for queue: ${queueName}`);
    } catch (error) {
        console.error("[Tasks] FATAL: Failed to initialize Cloud Tasks.", error);
        throw error;
    }
}

/**
 * Enqueues a job into Google Cloud Tasks.
 * @param {string} jobId - The MongoDB ID of the job.
 */
export async function enqueueJob(jobId: string): Promise<void> {
    if (!client || !queuePath || !workerUrl) {
        throw new Error('Tasks client not initialized. Call initTasks first.');
    }

    const payload = JSON.stringify({ jobId });
    const body = Buffer.from(payload).toString('base64');

    const task = {
        httpRequest: {
            httpMethod: 'POST' as const,
            url: workerUrl,
            headers: { 'Content-Type': 'application/json' },
            body,
            oidcToken: { serviceAccountEmail },
        },
    };

    await client.createTask({ parent: queuePath, task });
    console.log(`[Tasks] Successfully enqueued job: ${jobId}`);
}