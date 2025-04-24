export default async (req, res) => {
    const { jobId, enabled, schedule } = req.body;
    try {
        const payload = { job: {} };
        if (enabled !== undefined) payload.job.enabled = enabled;
        if (schedule) payload.job.schedule = schedule;

        const response = await fetch(`https://api.cron-job.org/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.CRON_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to update job');
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
