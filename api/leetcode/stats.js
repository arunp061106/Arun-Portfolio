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
  const username = urlObj.searchParams.get('username') || process.env.LEETCODE_USERNAME || 'f5oMCKlfVr';
  const cacheKey = `lc_stats_${username}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.statusCode = 200;
    res.end(JSON.stringify({ ...cached, cached: true }));
    return;
  }

  try {
    let result = null;

    // Primary: LeetCode official public GraphQL API
    try {
      const gqlRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: JSON.stringify({
          query: `query userProblemsSolved($username: String!) {
            allQuestionsCount {
              difficulty
              count
            }
            matchedUser(username: $username) {
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
              profile {
                ranking
                userAvatar
                realName
              }
            }
          }`,
          variables: { username }
        })
      });

      if (gqlRes.ok) {
        const gqlData = await gqlRes.json();
        const allCounts = gqlData.data?.allQuestionsCount || [];
        const userStats = gqlData.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
        const profile = gqlData.data?.matchedUser?.profile || {};

        if (allCounts.length > 0 && userStats.length > 0) {
          const findTotal = (diff) => (allCounts.find(c => c.difficulty.toLowerCase() === diff.toLowerCase())?.count || 0);
          const findSolved = (diff) => (userStats.find(s => s.difficulty.toLowerCase() === diff.toLowerCase())?.count || 0);

          result = {
            username,
            realName: profile.realName || 'Arun Karthick P',
            totalSolved: findSolved('all'),
            totalProblems: findTotal('all') || 4082,
            easySolved: findSolved('easy'),
            easyTotal: findTotal('easy') || 971,
            mediumSolved: findSolved('medium'),
            mediumTotal: findTotal('medium') || 2128,
            hardSolved: findSolved('hard'),
            hardTotal: findTotal('hard') || 983,
            attempting: 0,
            ranking: profile.ranking || null,
            updatedAt: new Date().toISOString()
          };
        }
      }
    } catch (gqlErr) {
      console.warn('LeetCode GraphQL error, attempting secondary fallback:', gqlErr.message);
    }

    // Secondary fallback: alfa-leetcode-api
    if (!result) {
      const alfaRes = await fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/solved`);
      if (alfaRes.ok) {
        const alfa = await alfaRes.json();
        result = {
          username,
          realName: 'Arun Karthick P',
          totalSolved: alfa.solvedProblem || 0,
          totalProblems: 4082,
          easySolved: alfa.easySolved || 0,
          easyTotal: 971,
          mediumSolved: alfa.mediumSolved || 0,
          mediumTotal: 2128,
          hardSolved: alfa.hardSolved || 0,
          hardTotal: 983,
          attempting: 0,
          ranking: null,
          updatedAt: new Date().toISOString()
        };
      }
    }

    if (!result) {
      throw new Error('Unable to retrieve LeetCode statistics from remote sources');
    }

    cache.set(cacheKey, result, 30 * 60 * 1000);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error('Error in LeetCode endpoint:', err);
    const stale = cache.getOrFallback(cacheKey);
    if (stale) {
      res.statusCode = 200;
      res.end(JSON.stringify({ ...stale, isStale: true }));
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Failed to fetch LeetCode statistics', message: err.message }));
  }
};
