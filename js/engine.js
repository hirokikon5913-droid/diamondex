// --- 試合シミュレーションエンジン ---
const engine = {
    // 試合のエントリーポイント
    simulateMatch: (mode, myTeam, enemyTeam) => {
        let logOutput = [];
        let myScore = 0;
        let enemyScore = 0;

        logOutput.push("【Play Ball】試合開始！");

        // 簡易的な9イニングループ
        for (let inning = 1; inning <= 9; inning++) {
            // モード1(1球進行)の疑似表現
            if (mode === 1) {
                logOutput.push(`--- ${inning}回表 ---`);
                logOutput.push("ピッチャー投げました、打った！");
            }

            // 乱数と調子補正を加味した得点計算
            let myInningScore = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;
            let enemyInningScore = Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0;

            myScore += myInningScore;
            enemyScore += enemyInningScore;

            // モード2(ダイジェスト): 点が入った時だけログ
            if (mode === 2 && (myInningScore > 0 || enemyInningScore > 0)) {
                logOutput.push(`[${inning}回] スコアが動きました！ (自 ${myScore} - ${enemyScore} 敵)`);
            }
        }

        logOutput.push(`【Game Set】 試合終了: 自球団 ${myScore} - ${enemyScore} 敵球団`);
        
        // 勝敗結果を返す
        return {
            win: myScore > enemyScore,
            lose: myScore < enemyScore,
            draw: myScore === enemyScore,
            logs: logOutput
        };
    }
};

