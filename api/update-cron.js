export default async (req, res) => {
  const { jobId, enabled, schedule, endpoint } = req.body;

  try {
    const payload = {
      job: {
        enabled: enabled !== undefined ? enabled : undefined,
        schedule: schedule || undefined,
        url: endpoint || undefined
      }
    };

    const response = await fetch(`https://api.cron-job.org/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update job');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
}
