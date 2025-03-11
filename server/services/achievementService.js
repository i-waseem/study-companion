const User = require('../models/User');

// XP requirements for each level
const LEVEL_XP_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  // Add more levels as needed
};

// XP rewards for different actions
const XP_REWARDS = {
  quiz: {
    completion: 50,
    perfectScore: 200,
    improvement: 100
  },
  flashcard: {
    creation: 20,
    practice: 30,
    mastery: 100
  },
  notes: {
    creation: 30,
    update: 10,
    sharing: 50
  },
  study: {
    session: 10, // per 30 minutes
    streak: 20,  // per day
    goalAchieved: 50
  },
  career: {
    assessment: 50,
    goalSetting: 30,
    research: 20
  }
};

class AchievementService {
  // Add XP to user and handle level ups
  static async addXP(userId, amount, category, details = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Add XP
      user.xp += amount;

      // Check for level up
      const currentLevel = user.level;
      let newLevel = currentLevel;

      // Find the highest level the user qualifies for
      for (const [level, requirement] of Object.entries(LEVEL_XP_REQUIREMENTS)) {
        if (user.xp >= requirement) {
          newLevel = Math.max(newLevel, parseInt(level));
        }
      }

      // Handle level up
      if (newLevel > currentLevel) {
        user.level = newLevel;
        // You might want to trigger some notification or reward here
      }

      await user.save();
      return { xpGained: amount, newLevel, oldLevel: currentLevel };
    } catch (error) {
      console.error('Error adding XP:', error);
      throw error;
    }
  }

  // Award a badge to user
  static async awardBadge(userId, badgeData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Check if user already has this badge
      const existingBadge = user.badges.find(b => b.name === badgeData.name);
      if (existingBadge) {
        // Update progress if badge exists
        existingBadge.progress = badgeData.progress;
        if (existingBadge.progress >= existingBadge.maxProgress) {
          existingBadge.earnedAt = new Date();
        }
      } else {
        // Add new badge
        user.badges.push({
          ...badgeData,
          earnedAt: badgeData.progress >= badgeData.maxProgress ? new Date() : null
        });
      }

      await user.save();
      return user.badges;
    } catch (error) {
      console.error('Error awarding badge:', error);
      throw error;
    }
  }

  // Update achievement progress
  static async updateAchievement(userId, achievementName, progress) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const achievement = user.achievements.find(a => a.name === achievementName);
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      achievement.progress = progress;
      if (progress >= achievement.target && !achievement.isCompleted) {
        achievement.isCompleted = true;
        achievement.unlockedAt = new Date();
        // Award XP for completing achievement
        await this.addXP(userId, 100, 'achievement', { achievementName });
      }

      await user.save();
      return achievement;
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  }

  // Get user's achievement summary
  static async getAchievementSummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      return {
        level: user.level,
        xp: user.xp,
        nextLevelXP: LEVEL_XP_REQUIREMENTS[user.level + 1] || null,
        badges: user.badges,
        achievements: user.achievements,
        recentUnlocks: [...user.badges, ...user.achievements]
          .filter(item => item.earnedAt || item.unlockedAt)
          .sort((a, b) => (b.earnedAt || b.unlockedAt) - (a.earnedAt || a.unlockedAt))
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting achievement summary:', error);
      throw error;
    }
  }
}

module.exports = AchievementService;
