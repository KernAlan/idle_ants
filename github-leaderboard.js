class GitHubLeaderboard {
    constructor() {
        // Your JSONBin ID for adil_ants_leaderboard
        this.binId = '6881cad07b4b8670d8a669db'; 
        this.apiUrl = 'https://api.jsonbin.io/v3/b';
        this.readUrl = `${this.apiUrl}/${this.binId}/latest`;
        this.writeUrl = `${this.apiUrl}/${this.binId}`;
    }

    async getLeaderboard() {
        try {
            const response = await fetch(this.readUrl);
            if (!response.ok) {
                console.log('Failed to fetch leaderboard, returning empty');
                return [];
            }
            
            const data = await response.json();
            const scores = data.record || [];
            return scores.sort((a, b) => b.total_score - a.total_score);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
    }

    async submitScore(playerData) {
        try {
            // Get current scores
            const currentScores = await this.getLeaderboard();
            
            // Add new score with timestamp
            const newScore = {
                ...playerData,
                submitted_at: new Date().toISOString()
            };
            currentScores.push(newScore);
            
            // Keep only top 100 scores to prevent bin getting too large
            currentScores.sort((a, b) => b.total_score - a.total_score);
            const trimmedScores = currentScores.slice(0, 100);
            
            // Update the JSONBin
            const response = await fetch(this.writeUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trimmedScores)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('JSONBin API error:', response.status, errorText);
                throw new Error('Failed to update leaderboard');
            }
            
            // Calculate rank
            const rank = trimmedScores.findIndex(score => 
                score.player_name === playerData.player_name && 
                score.total_score === playerData.total_score
            ) + 1;
            
            return {
                success: true,
                rank: rank,
                total_players: trimmedScores.length
            };
            
        } catch (error) {
            console.error('Error submitting score:', error);
            return { success: false, error: error.message };
        }
    }


    async getPlayerRank(playerName) {
        const scores = await this.getLeaderboard();
        const playerScores = scores.filter(score => score.player_name === playerName);
        
        if (playerScores.length === 0) {
            return { found: false };
        }
        
        const bestScore = playerScores[0];
        const rank = scores.findIndex(score => 
            score.player_name === playerName && 
            score.total_score === bestScore.total_score
        ) + 1;
        
        return {
            found: true,
            rank: rank,
            score: bestScore,
            total_players: scores.length
        };
    }
}

// Usage example:
// const leaderboard = new GitHubLeaderboard(); // Now uses JSONBin.io
// 
// // Submit a score
// leaderboard.submitScore({
//     player_name: 'PlayerName',
//     total_score: 12345,
//     food_collected: 1000,
//     play_time: 3600
// });
//
// // Get leaderboard
// leaderboard.getLeaderboard().then(scores => {
//     console.log('Top 10:', scores.slice(0, 10));
// });