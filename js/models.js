// --- データモデル (選手・チーム・人事) ---
const lastNames = ["鈴木", "佐藤", "田中", "高橋", "伊藤", "渡辺", "山本", "中村", "小林", "加藤"];
const positions = ["SP", "RP", "CP", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];
const conditions = ["絶不調", "不調", "普通", "好調", "絶好調"];

class Player {
    constructor(isPitcher) {
        this.name = lastNames[Math.floor(Math.random() * lastNames.length)];
        this.isPitcher = isPitcher;
        this.age = 18 + Math.floor(Math.random() * 10);
        
        // 利き腕の決定 (左投げは約30%)
        this.throws = Math.random() < 0.3 ? 'L' : 'R';
        this.bats = Math.random() < 0.4 ? 'L' : (Math.random() < 0.1 ? 'S' : 'R');
        
        // 基礎ステータス (1-100)
        this.stats = {
            contact: Math.floor(Math.random() * 60) + 20,
            power: Math.floor(Math.random() * 60) + 20,
            defense: Math.floor(Math.random() * 60) + 20, // 守備力
            pitching: isPitcher ? Math.floor(Math.random() * 60) + 20 : 0
        };
        
        this.condition = 2; // 0:絶不調 〜 4:絶好調
        this.aptitude = {}; // ポジション適性(S-G)
        this.generateAptitude();
        
        this.order = null; // 1-9 (打順) または null
        this.currentPos = null; // 試合での守備位置
    }

    // 守備力ベースの適性ロジック＆利き腕制約
    generateAptitude() {
        if (this.isPitcher) {
            this.mainPos = Math.random() > 0.3 ? "SP" : "RP";
            return;
        }
        
        // 野手のメインポジション決定
        let possibleMains = ["1B", "LF", "CF", "RF"];
        if (this.throws === 'R') {
            possibleMains.push("C", "2B", "3B", "SS"); // 右投げのみ
        }
        this.mainPos = possibleMains[Math.floor(Math.random() * possibleMains.length)];
        
        // 守備力からランクを算出 (簡易版)
        const getRank = (val) => val >= 80 ? 'S' : val >= 70 ? 'A' : val >= 60 ? 'B' : val >= 50 ? 'C' : val >= 40 ? 'D' : val >= 30 ? 'E' : 'F';
        
        this.aptitude[this.mainPos] = getRank(this.stats.defense);
        // ※ 本来はここでサブポジションの相関ペナルティ計算が入る
    }

    getOvr() {
        // 調子による補正 (1段階±5%)
        const condModifier = 1.0 + ((this.condition - 2) * 0.05);
        if (this.isPitcher) return Math.floor(this.stats.pitching * condModifier);
        return Math.floor(((this.stats.contact + this.stats.power + this.stats.defense)/3) * condModifier);
    }
}

