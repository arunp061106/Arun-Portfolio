const cache = require('../cache');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse query parameters
  const urlObj = new URL(req.url, 'http://localhost');
  const username = urlObj.searchParams.get('username') || process.env.GITHUB_USERNAME || 'arunp061106';
  const year = urlObj.searchParams.get('year') || 'last';
  const cacheKey = `gh_contribs_${username}_${year}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.statusCode = 200;
    res.end(JSON.stringify({ ...cached, cached: true }));
    return;
  }

  try {
    let result = null;
    const token = process.env.GITHUB_TOKEN;

    // Method A: GraphQL API if GITHUB_TOKEN is available
    if (token) {
      try {
        let fromDate, toDate;
        if (year !== 'last' && /^\d{4}$/.test(year)) {
          fromDate = `${year}-01-01T00:00:00Z`;
          toDate = `${year}-12-31T23:59:59Z`;
        }
        const query = `
          query($username: String!, $from: DateTime, $to: DateTime) {
            user(login: $username) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                      contributionLevel
                      weekday
                    }
                  }
                }
              }
            }
          }
        `;
        const ghRes = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Portfolio-App'
          },
          body: JSON.stringify({
            query,
            variables: { username, from: fromDate, to: toDate }
          })
        });

        if (ghRes.ok) {
          const ghJson = await ghRes.json();
          const calendar = ghJson.data?.user?.contributionsCollection?.contributionCalendar;
          if (calendar) {
            const levelMap = {
              'NONE': 0,
              'FIRST_QUARTILE': 1,
              'SECOND_QUARTILE': 2,
              'THIRD_QUARTILE': 3,
              'FOURTH_QUARTILE': 4
            };
            const weeks = (calendar.weeks || []).map(w => ({
              days: (w.contributionDays || []).map(d => ({
                date: d.date,
                count: d.contributionCount,
                level: levelMap[d.contributionLevel] ?? (d.contributionCount > 0 ? 1 : 0),
                weekday: d.weekday
              }))
            }));
            result = {
              username,
              year,
              totalContributions: calendar.totalContributions,
              weeks,
              availableYears: ['2026', '2025'],
              updatedAt: new Date().toISOString()
            };
          }
        }
      } catch (gqlErr) {
        console.warn('GitHub GraphQL fetch failed, falling back to HTML endpoint:', gqlErr.message);
      }
    }

    // Method B: Public GitHub contribution HTML endpoint
    if (!result) {
      let fetchUrl = `https://github.com/users/${encodeURIComponent(username)}/contributions`;
      if (year !== 'last' && /^\d{4}$/.test(year)) {
        fetchUrl += `?from=${year}-01-01&to=${year}-12-31`;
      }
      const htmlRes = await fetch(fetchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!htmlRes.ok) throw new Error(`GitHub HTML status ${htmlRes.status}`);
      const html = await htmlRes.text();

      // Extract header count
      let totalContributions = 0;
      const headerMatch = html.match(/([0-9,]+)\s+contributions/i);
      if (headerMatch) {
        totalContributions = parseInt(headerMatch[1].replace(/,/g, ''), 10);
      }

      // Extract tooltip text by element ID
      const tipRegex = /<tool-tip[^>]+for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g;
      const tipMap = {};
      let tm;
      while ((tm = tipRegex.exec(html)) !== null) {
        tipMap[tm[1]] = tm[2].trim();
      }

      // Extract days
      const tdRegex = /<td[^>]+data-date="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g;
      const rawDays = [];
      let dm;
      while ((dm = tdRegex.exec(html)) !== null) {
        const tdTag = dm[0];
        const date = dm[1];
        const levelMatch = tdTag.match(/data-level="([^"]+)"/);
        const idMatch = tdTag.match(/id="([^"]+)"/);
        const dayId = idMatch ? idMatch[1] : null;
        let count = 0;
        let tooltip = `No contributions on ${date}`;

        if (dayId && tipMap[dayId]) {
          tooltip = tipMap[dayId];
          const countMatch = tooltip.match(/^([0-9]+)\s+contribution/i);
          count = countMatch ? parseInt(countMatch[1], 10) : 0;
        }

        const level = levelMatch ? parseInt(levelMatch[1], 10) : (count > 0 ? 1 : 0);
        rawDays.push({
          date,
          count,
          level,
          tooltip
        });
      }

      // Group days into weeks of 7 days
      const weeks = [];
      for (let i = 0; i < rawDays.length; i += 7) {
        weeks.push({
          days: rawDays.slice(i, i + 7)
        });
      }

      // If header regex didn't catch total, calculate sum of days
      if (totalContributions === 0 && rawDays.length > 0) {
        totalContributions = rawDays.reduce((sum, d) => sum + d.count, 0);
      }

      result = {
        username,
        year,
        totalContributions,
        weeks,
        availableYears: ['2026', '2025'],
        updatedAt: new Date().toISOString()
      };
    }

    // Cache for 30 minutes
    cache.set(cacheKey, result, 30 * 60 * 1000);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error('Error in contributions endpoint:', err);
    const stale = cache.getOrFallback(cacheKey);
    if (stale) {
      res.statusCode = 200;
      res.end(JSON.stringify({ ...stale, isStale: true }));
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to fetch contributions', message: err.message }));
  }
};
