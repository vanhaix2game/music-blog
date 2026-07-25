class Leaderboard {
  static STORAGE_KEY = 'myai_leaderboard';

  static init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      this.seed();
    }
  }

  static seed() {
    const names = ['PetMaster', 'DragonSlayer', 'PetLover', 'RobotKing', 'MysticLord', 'TopPlayer', 'PetCollector', 'BattleQueen'];
    const entries = names.map(name => ({
      name,
      power: 5000 + Math.floor(Math.random() * 50000),
      petCount: 3 + Math.floor(Math.random() * 10),
      rating: 1000 + Math.floor(Math.random() * 500),
      wins: Math.floor(Math.random() * 100),
      losses: Math.floor(Math.random() * 50)
    }));
    entries.sort((a, b) => b.power - a.power);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  static getRankings() {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
      return data.sort((a, b) => b.power - a.power).slice(0, DATA.LEADERBOARD_SIZE);
    } catch {
      return [];
    }
  }

  static updatePlayer(player) {
    const rankings = this.getRankings();
    const idx = rankings.findIndex(r => r.name === player.name);
    const entry = {
      name: player.name,
      power: player.totalPower,
      petCount: player.pets.length,
      rating: player.pvpRating,
      wins: player.pvpWins,
      losses: player.pvpLosses
    };
    if (idx >= 0) {
      rankings[idx] = entry;
    } else {
      rankings.push(entry);
    }
    rankings.sort((a, b) => b.power - a.power);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rankings.slice(0, DATA.LEADERBOARD_SIZE)));
  }
}
