const fs = require('fs');
const readline = require('readline');

async function parseLog(logFile) {
  const userActivity = new Map();

  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
  });

  for await (const line of rl) {
    const [dateStr, user, action] = line.split(', ');
    const date = new Date(dateStr);

    if (!userActivity.has(user)) {
      userActivity.set(user, []);
    }

    userActivity.get(user).push(date);
  }

  return userActivity;
}

function calculateStreaks(userActivity) {
  const userStreaks = new Map();

  for (const [user, dates] of userActivity.entries()) {
    dates.sort((a, b) => a - b);
    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1];
      const currDate = dates[i];
      const timeDiff = currDate - prevDate;
      const oneDay = 24 * 60 * 60 * 1000;

      if (timeDiff === oneDay) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }

    userStreaks.set(user, { maxStreak, activityCount: dates.length, latestDate: dates[dates.length - 1] });
  }

  return userStreaks;
}


function findTopKUsers(userStreaks, k) {
  const sortedUsers = Array.from(userStreaks.entries()).sort((a, b) => {
    if (b[1].maxStreak === a[1].maxStreak) {
      if(b[1].activityCount === a[1].activityCount) {
        return b[1].latestDate - a[1].latestDate;
      }
      return b[1].activityCount - a[1].activityCount;
    }
    return b[1].maxStreak - a[1].maxStreak;
  });

  return sortedUsers.slice(0, k).map(([user]) => {
    return user
  });
}

(async function() {
  const logFile = 'log.txt';
  const k = 2;

  const userActivity = await parseLog(logFile);
  const userStreaks = calculateStreaks(userActivity);
  const topUsers = findTopKUsers(userStreaks, k);

  console.log(topUsers);
})();
