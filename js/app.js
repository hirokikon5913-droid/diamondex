// --- アプリケーション制御・UIロジック ---
const app = {
    state: {
        year: 1, month: 3, day: 1, // 日次進行
        funds: 5000, wins: 0, losses: 0,
        roster: []
    },

    init: () => {
        // 初期ロスター生成 (野手14, 投手6)
        for(let i=0; i<14; i++) app.state.roster.push(new Player(false));
        for(let i=0; i<6; i++) app.state.roster.push(new Player(true));
        
        app.autoSetOrder(); // 仮のスタメン組み
        app.updateUI();
        app.log("オーナー:「今季は必ずAクラスに入りたまえ。期待しているよ。」");
    },

    switchTab: (tabId) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector(`button[onclick="app.switchTab('${tabId}')"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    },

    log: (msg) => {
        const w = document.getElementById('log-window');
        w.innerHTML = `<div class="log-entry">${msg}</div>` + w.innerHTML;
    },

    // バリデーション: スタメンが9人(野手)+1人(投手)いるか？適性外はいないか？
    checkRosterValid: () => {
        const starters = app.state.roster.filter(p => p.order !== null || p.currentPos === "SP");
        const batters = starters.filter(p => !p.isPitcher).length;
        const pitchers = starters.filter(p => p.isPitcher).length;
        
        const alertBox = document.getElementById('validation-alert');
        if (batters < 9 || pitchers < 1) {
            alertBox.innerText = `⚠️ スタメンが不足しています (野手:${batters}/9 投手:${pitchers}/1)`;
            alertBox.style.display = 'block';
            return false;
        }
        alertBox.style.display = 'none';
        return true;
    },

    autoSetOrder: () => {
        // 全リセット
        app.state.roster.forEach(p => { p.order = null; p.currentPos = null; });
        
        // 簡易的な自動編成 (本来は適性や利き腕を厳密にチェック)
        let batters = app.state.roster.filter(p => !p.isPitcher).sort((a,b) => b.getOvr() - a.getOvr());
        let pitchers = app.state.roster.filter(p => p.isPitcher).sort((a,b) => b.getOvr() - a.getOvr());
        
        for(let i=0; i<9; i++) { batters[i].order = i+1; batters[i].currentPos = batters[i].mainPos; }
        pitchers[0].currentPos = "SP"; // 先発
        
        app.updateUI();
    },

    playMatch: (mode) => {
        if (!app.checkRosterValid()) return;
        
        // エンジンを呼び出してシミュレーション
        app.log(`--- ${app.state.month}月${app.state.day}日 試合開始 (モード${mode}) ---`);
        const result = engine.simulateMatch(mode, app.state.roster, null);
        
        result.logs.forEach(l => app.log(l));
        
        if (result.win) app.state.wins++;
        if (result.lose) app.state.losses++;
        
        app.advanceDay();
    },

    advanceDay: () => {
        app.state.day++;
        // 簡易的なカレンダー処理 (30日で月またぎ)
        if (app.state.day > 30) {
            app.state.day = 1;
            app.state.month++;
            // 月次収益などの処理をここに挟む
        }
        // 全選手の調子をランダム変動
        app.state.roster.forEach(p => {
            if(Math.random() > 0.7) p.condition = Math.max(0, Math.min(4, p.condition + (Math.random() > 0.5 ? 1 : -1)));
        });
        
        app.updateUI();
    },

    updateUI: () => {
        document.getElementById('current-date').innerText = `${app.state.year}年目 ${app.state.month}月${app.state.day}日`;
        document.getElementById('record').innerText = `${app.state.wins}勝${app.state.losses}敗`;
        app.checkRosterValid();

        // ロスター(スタメン)の描画
        const orderList = document.getElementById('order-list');
        const benchList = document.getElementById('bench-list');
        orderList.innerHTML = ''; benchList.innerHTML = '';

        app.state.roster.forEach(p => {
            const condText = conditions[p.condition];
            const condClass = p.condition === 4 ? 'cond-5' : p.condition === 0 ? 'cond-1' : '';
            
            const cardHTML = `
                <div class="player-card">
                    <div>
                        <strong>${p.order ? p.order+'番' : ''} ${p.currentPos || p.mainPos}</strong> ${p.name}
                        <div class="p-tags">
                            <span>投/打:${p.throws}${p.bats}</span>
                            <span class="${condClass}">調子:${condText}</span>
                        </div>
                    </div>
                    <div>OVR: ${p.getOvr()}</div>
                </div>
            `;
            if (p.order !== null || p.currentPos === "SP") orderList.innerHTML += cardHTML;
            else benchList.innerHTML += cardHTML;
        });
    }
};

// 起動
window.onload = app.init;

