export default async (req, res) => {
    const { jobId } = req.query;
    try {
        const response = await fetch(`https://api.cron-job.org/jobs/${jobId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.CRON_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
