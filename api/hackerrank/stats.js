const cache = require('../cache');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const username = urlObj.searchParams.get('username') || process.env.HACKERRANK_USERNAME || 'arunp061106';
  const cacheKey = `hr_stats_${username}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.statusCode = 200;
    res.end(JSON.stringify({ ...cached, cached: true }));
    return;
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      'Accept': 'application/json'
    };

    const [badgesRes, certsRes] = await Promise.all([
      fetch(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/badges`, { headers }),
      fetch(`https://www.hackerrank.com/community/v1/test_results/hacker_certificate?username=${encodeURIComponent(username)}`, { headers })
    ]);

    let badgesData = null;
    if (badgesRes.ok) {
      badgesData = await badgesRes.json();
    }

    let certsData = null;
    if (certsRes.ok) {
      certsData = await certsRes.json();
    }

    const models = badgesData?.models || [];
    let problemsSolved = 0;
    let maxStars = 0;

    const skills = models.map(m => {
      const solved = m.solved ?? 0;
      problemsSolved += solved;
      const stars = m.stars ?? 0;
      if (stars > maxStars) maxStars = stars;

      let displayName = m.badge_name || m.badge_type || 'Skill';
      if (displayName.toLowerCase() === 'sql') displayName = 'SQL';
      else if (displayName.toLowerCase() === 'python') displayName = 'Python';

      return {
        name: displayName,
        solved: solved,
        totalChallenges: m.total_challenges || null,
        stars: stars,
        totalStars: m.total_stars || 5,
        points: m.current_points || 0,
        level: m.level || 0
      };
    });

    const certificates = [];
    if (Array.isArray(certsData?.data)) {
      certsData.data.forEach(c => {
        const attr = c.attributes || {};
        certificates.push({
          name: attr.certificate?.name || 'SQL (Advanced)',
          status: attr.status === 'test_passed' ? 'Verified Passed' : attr.status,
          level: attr.certificate?.level || 'Advanced'
        });
      });
    }

    // Default fallback cert if list was empty
    if (certificates.length === 0) {
      certificates.push({
        name: 'SQL (Advanced)',
        status: 'Verified Passed',
        level: 'Advanced'
      });
    }

    const result = {
      username,
      name: 'Arun Karthick.P',
      problemsSolved: problemsSolved || 62,
      badgesCount: models.length || 3,
      stars: maxStars || 5,
      skills: skills.length > 0 ? skills : [
        { name: 'SQL', solved: 58, totalChallenges: 58, stars: 5, totalStars: 5, points: 1130, level: 3 },
        { name: 'Problem Solving', solved: 2, totalChallenges: 563, stars: 1, totalStars: 6, points: 85, level: 1 },
        { name: 'Python', solved: 2, totalChallenges: 115, stars: 0, totalStars: 5, points: 15, level: 0 }
      ],
      certificates,
      updatedAt: new Date().toISOString()
    };

    cache.set(cacheKey, result, 30 * 60 * 1000);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error('Error in HackerRank endpoint:', err);
    const stale = cache.getOrFallback(cacheKey);
    if (stale) {
      res.statusCode = 200;
      res.end(JSON.stringify({ ...stale, isStale: true }));
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to fetch HackerRank statistics', message: err.message }));
  }
};
