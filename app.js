// =========================================================
// ❄️ 2026 동파육 (WINTER SPORTS TOURNAMENT) - FRONTEND LOGIC
// =========================================================

// 1. 파이어베이스 초기화
const firebaseConfig = {
    databaseURL: "https://dongpa2026-2fda5-default-rtdb.asia-southeast1.firebasedatabase.app"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. 전역 데이터 저장소
let appData = {
    players: [],
    skeleton: [],
    bobsleigh: [],
    skijump: [],
    biathlon: []
};

// 3. 상태 관리 (종합 순위용)
let viewState = {
    standingsType: 'team',  // 'team' | 'player'
    standingsSort: 'points' // 'points' | 'medals'
};

// =========================================================
// 초기화 및 네비게이션 로직
// =========================================================
window.onload = () => {
    initFirebaseListeners();
    
    const hash = window.location.hash.replace('#', '');
    const initialTab = hash || 'home';
    
    history.replaceState({ tab: initialTab }, '', `#${initialTab}`);
    switchTab(initialTab, true);
};

window.onpopstate = (event) => {
    if (event.state && event.state.tab) switchTab(event.state.tab, true);
    else switchTab('home', true);
};

window.switchTab = (tabId, isFromHistory = false) => {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    const targetSection = document.getElementById(`view-${tabId}`);
    if (targetSection) targetSection.classList.add('active');
    
    const targetBtn = document.querySelector(`.nav-link[onclick*="${tabId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    if (!isFromHistory) history.pushState({ tab: tabId }, '', `#${tabId}`);

    renderCurrentView();
    window.scrollTo(0,0);
};

function initFirebaseListeners() {
    db.ref('WinterPlayers').on('value', snap => { appData.players = snap.val() || []; renderCurrentView(); });
    db.ref('WinterSkeleton').on('value', snap => { appData.skeleton = snap.val() || []; renderCurrentView(); });
    db.ref('WinterBobsleigh').on('value', snap => { appData.bobsleigh = snap.val() || []; renderCurrentView(); });
    db.ref('WinterSkiJump').on('value', snap => { appData.skijump = snap.val() || []; renderCurrentView(); });
    db.ref('WinterBiathlon').on('value', snap => { appData.biathlon = snap.val() || []; renderCurrentView(); });
}

function renderCurrentView() {
    const activeTab = document.querySelector('.view-section.active');
    if (!activeTab) return;
    
    if (activeTab.id === 'view-players') renderPlayers();
    if (activeTab.id === 'view-skeleton') renderSkeleton();
    if (activeTab.id === 'view-bobsleigh') renderBobsleigh();
    if (activeTab.id === 'view-skijump') renderSkiJump();
    if (activeTab.id === 'view-biathlon') renderBiathlon();
    if (activeTab.id === 'view-standings') renderStandings();
}

// =========================================================
// 유틸리티 함수
// =========================================================
function getTeamColor(teamName) {
    const p = appData.players.find(x => x.team === teamName && x.color);
    return p ? p.color : '#555555';
}

function getPlayerImg(name) {
    const p = appData.players.find(x => x.name === name);
    return p ? p.img : 'images/logo.png';
}

function getNameStackHTML(name, teamName) {
    const tColor = getTeamColor(teamName);
    return `
        <div class="name-stack">
            <div class="stack-team" style="color:${tColor};">${teamName}</div>
            <div class="stack-name">${name}</div>
        </div>
    `;
}

// =========================================================
// [1] 참가자 (Players) 렌더링
// =========================================================
function renderPlayers() {
    const container = document.getElementById('players-grid');
    if (!container) return;
    if (appData.players.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888;">참가자 데이터를 불러오는 중입니다...</p>';
        return;
    }

    const teamsMap = {};
    appData.players.forEach(p => {
        if (!teamsMap[p.team]) teamsMap[p.team] = [];
        teamsMap[p.team].push(p);
    });

    let html = '';
    Object.keys(teamsMap).forEach(teamName => {
        const members = teamsMap[teamName];
        const tColor = getTeamColor(teamName);
        
        const cardStyle = `background: linear-gradient(135deg, ${tColor}22 0%, #111 80%); border-color: ${tColor};`;
        const headerStyle = `color: ${tColor}; text-shadow: 0 0 10px ${tColor};`;

        const membersHTML = members.map(m => {
            const captainStyle = m.isCaptain ? `border: 4px solid ${tColor}; box-shadow: 0 0 20px ${tColor};` : `border-color: ${tColor};`;
            const captainCrown = m.isCaptain ? `<div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-size:1.8rem; z-index:3;">👑</div>` : '';
            
            return `
                <div class="player-card-box" style="position:relative; margin-top:25px;">
                    ${captainCrown}
                    <img src="${m.img}" class="player-photo-large" onerror="this.src='images/logo.png'" style="${captainStyle}">
                    <div class="player-info-box">
                        <span class="player-name-large">${m.name}</span>
                    </div>
                </div>
            `;
        }).join('');

        html += `
            <div class="team-card" style="${cardStyle}">
                <div class="team-name-header" style="${headerStyle}">${teamName}</div>
                <div class="team-players-row">${membersHTML}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// =========================================================
// [2] 스켈레톤
// =========================================================
function renderSkeleton() {
    const list = document.getElementById('skeleton-list');
    if (!list) return;
    list.innerHTML = appData.skeleton.map(p => `
        <tr>
            <td><span class="rank-num rank-${p.rank}">${p.rank}</span></td>
            <td><div class="cell-left"><img src="${getPlayerImg(p.name)}" class="p-avatar" onerror="this.src='images/logo.png'">${getNameStackHTML(p.name, p.team)}</div></td>
            <td class="gap-time">${p.run1}</td>
            <td class="gap-time">${p.run2}</td>
            <td class="record-time mint-glow-text">${p.totalDisplay}</td>
            <td class="gap-time">${p.gap}</td>
        </tr>
    `).join('');
}

// =========================================================
// [3] 봅슬레이
// =========================================================
function renderBobsleigh() {
    const list = document.getElementById('bobsleigh-list');
    if (!list) return;
    list.innerHTML = appData.bobsleigh.map(p => {
        const tColor = getTeamColor(p.team);
        const captain = appData.players.find(x => x.team === p.team && x.isCaptain);
        const capImg = captain ? captain.img : 'images/logo.png';
        
        return `
        <tr>
            <td><span class="rank-num rank-${p.rank}">${p.rank}</span></td>
            <td style="text-align:center;">
                <div style="display:flex; align-items:center; justify-content:center; gap:15px;">
                    <img src="${capImg}" class="p-avatar" style="width:45px; height:45px; border-color:${tColor};" onerror="this.src='images/logo.png'">
                    <span class="bobsleigh-team-text" style="color:${tColor}; text-shadow:0 0 15px ${tColor}88;">${p.team}</span>
                </div>
            </td>
            <td class="gap-time">${p.run1}</td>
            <td class="gap-time">${p.run2}</td>
            <td class="gap-time">${p.run3}</td>
            <td class="record-time mint-glow-text">${p.totalDisplay}</td>
            <td class="gap-time">${p.gap}</td>
        </tr>
    `}).join('');
}

// =========================================================
// [4] 스키점프
// =========================================================
function renderSkiJump() {
    const list = document.getElementById('skijump-list');
    if (!list) return;
    list.innerHTML = appData.skijump.map(p => `
        <tr>
            <td><span class="rank-num rank-${p.rank}">${p.rank}</span></td>
            <td><div class="cell-left"><img src="${getPlayerImg(p.name)}" class="p-avatar" onerror="this.src='images/logo.png'">${getNameStackHTML(p.name, p.team)}</div></td>
            <td class="gap-time">${p.run1}</td>
            <td class="gap-time">${p.run2}</td>
            <td class="record-time mint-glow-text" style="font-size:1.3rem;">${p.totalDisplay}</td>
            <td class="gap-time" style="color:#ff9f43;">${p.gap}</td>
        </tr>
    `).join('');
}

// =========================================================
// [5] 바이애슬론
// =========================================================
function renderBiathlon() {
    const list = document.getElementById('biathlon-list');
    if (!list) return;
    list.innerHTML = appData.biathlon.map(p => `
        <tr>
            <td><span class="rank-num rank-${p.rank}">${p.rank}</span></td>
            <td><div class="cell-left"><img src="${getPlayerImg(p.name)}" class="p-avatar" onerror="this.src='images/logo.png'">${getNameStackHTML(p.name, p.team)}</div></td>
            <td class="record-time mint-glow-text">${p.totalDisplay}</td>
            <td class="gap-time">${p.gap}</td>
        </tr>
    `).join('');
}

// =========================================================
// [6] 종합 순위 (Standings) 집계 및 렌더링 로직
// =========================================================

window.setStandingsType = (type) => {
    viewState.standingsType = type;
    document.getElementById('btn-type-team').classList.remove('active');
    document.getElementById('btn-type-player').classList.remove('active');
    document.getElementById(`btn-type-${type}`).classList.add('active');
    renderStandings();
};

window.setStandingsSort = (sortStr) => {
    viewState.standingsSort = sortStr;
    document.getElementById('btn-sort-points').classList.remove('active');
    document.getElementById('btn-sort-medals').classList.remove('active');
    document.getElementById(`btn-sort-${sortStr}`).classList.add('active');
    renderStandings();
};

window.toggleStandingsDetail = (idx) => {
    const detailBox = document.getElementById(`detail-box-${idx}`);
    const arrow = document.getElementById(`arrow-${idx}`);
    if (!detailBox || !arrow) return;
    
    if (detailBox.classList.contains('open')) {
        detailBox.classList.remove('open');
        arrow.classList.remove('rotated');
    } else {
        detailBox.classList.add('open');
        arrow.classList.add('rotated');
    }
};

function renderStandings() {
    const headerRow = document.getElementById('standings-header-row');
    const list = document.getElementById('standings-list');
    if (!headerRow || !list) return;

    const titleStr = viewState.standingsType === 'team' ? '팀명' : '선수명';
    headerRow.innerHTML = `
        <th width="10%">순위</th>
        <th width="40%">${titleStr} <span style="font-size:0.7rem; color:#888;"></span></th>
        <th width="10%">🥇 금</th>
        <th width="10%">🥈 은</th>
        <th width="10%">🥉 동</th>
        <th width="20%">총점</th>
    `;

    let stats = {}; 

    const addStats = (key, teamName, r, eventName, displayPlayerName) => {
        if (!stats[key]) {
            stats[key] = { name: key, team: teamName, gold: 0, silver: 0, bronze: 0, points: 0, details: [] };
        }
        if (r.rank === 1) stats[key].gold += 1;
        if (r.rank === 2) stats[key].silver += 1;
        if (r.rank === 3) stats[key].bronze += 1;
        stats[key].points += (r.points || 0);

        stats[key].details.push({
            eventName: eventName,
            playerName: displayPlayerName,
            teamName: teamName,
            rank: r.rank,
            pts: (r.points || 0)
        });
    };

    appData.skeleton.forEach(r => { 
        if(r.rank <= 3) addStats(viewState.standingsType === 'team' ? r.team : r.name, r.team, r, '스켈레톤', r.name); 
    });
    appData.skijump.forEach(r => { 
        if(r.rank <= 3) addStats(viewState.standingsType === 'team' ? r.team : r.name, r.team, r, '스키점프', r.name); 
    });
    appData.biathlon.forEach(r => { 
        if(r.rank <= 3) addStats(viewState.standingsType === 'team' ? r.team : r.name, r.team, r, '바이애슬론', r.name); 
    });
    
    // 봅슬레이 개인 기록 반영 추가 파트
    appData.bobsleigh.forEach(r => { 
        if(r.rank <= 3) {
            if (viewState.standingsType === 'team') {
                // 팀 종합 순위일 때는 팀 전체에 1번만 추가
                addStats(r.team, r.team, r, '봅슬레이', '단체전'); 
            } else {
                // 개인 MVP 순위일 때는 해당 팀의 '모든 팀원'에게 메달/점수 부여
                const members = appData.players.filter(p => p.team === r.team);
                members.forEach(member => {
                    addStats(member.name, member.team, r, '봅슬레이', '단체전');
                });
            }
        }
    });

    let results = Object.values(stats);

    results.sort((a, b) => {
        if (viewState.standingsSort === 'points') {
            if (b.points !== a.points) return b.points - a.points;
            if (b.gold !== a.gold) return b.gold - a.gold;
            if (b.silver !== a.silver) return b.silver - a.silver;
            return b.bronze - a.bronze;
        } else {
            if (b.gold !== a.gold) return b.gold - a.gold;
            if (b.silver !== a.silver) return b.silver - a.silver;
            if (b.bronze !== a.bronze) return b.bronze - a.bronze;
            return b.points - a.points;
        }
    });

    if (results.length === 0) {
        list.innerHTML = `<tr><td colspan="6" style="padding:40px; color:#888;">진행된 경기 결과가 없습니다.</td></tr>`;
        return;
    }

    const iconMap = { 
        '스켈레톤': 'skeleton.svg', 
        '봅슬레이': 'bobsleigh.svg', 
        '스키점프': 'skijump.svg', 
        '바이애슬론': 'biathlon.svg' 
    };

    let finalHTML = '';
    
    results.forEach((item, idx) => {
        const rank = idx + 1;
        const tColor = getTeamColor(item.team);
        
        let nameCellHTML = '';
        if (viewState.standingsType === 'team') {
            nameCellHTML = `<span class="bobsleigh-team-text" style="color:${tColor}; font-size:1.4rem;">${item.name}</span>`;
        } else {
            nameCellHTML = `<div class="cell-left"><img src="${getPlayerImg(item.name)}" class="p-avatar" onerror="this.src='images/logo.png'">${getNameStackHTML(item.name, item.team)}</div>`;
        }

        item.details.sort((a, b) => a.rank - b.rank);
        
        let detailItemsHTML = item.details.map(d => {
            let medalStr = d.rank === 1 ? '금메달' : d.rank === 2 ? '은메달' : '동메달';
            let colorStr = d.rank === 1 ? 'var(--podium-gold)' : d.rank === 2 ? 'var(--podium-silver)' : 'var(--podium-bronze)';
            let iconSrc = `images/sports/${iconMap[d.eventName]}`;
            
            let pName = d.playerName;
            if (d.eventName === '봅슬레이') {
                const members = appData.players.filter(p => p.team === d.teamName).map(p => p.name);
                pName = members.length > 0 ? members.join(', ') : d.teamName;
            }
            
            return `
                <div class="detail-medal-item">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${iconSrc}" class="detail-sport-icon" alt="${d.eventName}">
                        <span class="detail-event-name">${d.eventName}</span>
                        <span style="color:${colorStr}; font-weight:900; font-size:1.05rem;">${medalStr}</span>
                        <span style="color:#666; font-weight:bold; margin:0 4px;">-</span>
                        <span class="detail-player-name">${pName}</span>
                    </div>
                    <span class="detail-pts">+${d.pts} PT</span>
                </div>
            `;
        }).join('');

        if(item.details.length === 0) detailItemsHTML = '<div class="detail-medal-item" style="color:#888;">획득한 메달이 없습니다.</div>';

        finalHTML += `
            <tr class="standings-main-row" onclick="toggleStandingsDetail(${idx})" style="cursor:pointer;" title="클릭하여 상세 내역 보기">
                <td><span class="rank-num rank-${rank}">${rank}</span></td>
                <td>${nameCellHTML}</td>
                <td style="color:var(--podium-gold); font-size:1.2rem; font-weight:bold;">${item.gold}</td>
                <td style="color:var(--podium-silver); font-size:1.2rem; font-weight:bold;">${item.silver}</td>
                <td style="color:var(--podium-bronze); font-size:1.2rem; font-weight:bold;">${item.bronze}</td>
                
                <td class="standings-pts-cell">
                    <span class="mint-glow-text" style="font-size:1.4rem;">${item.points} PT</span>
                    <span id="arrow-${idx}" class="standings-row-arrow">▼</span>
                </td>
            </tr>
            <tr class="standings-detail-row">
                <td colspan="6" style="padding:0; border:none; background:transparent;">
                    <div id="detail-box-${idx}" class="standings-detail-box" style="border-left: 4px solid ${tColor};">
                        <div class="standings-detail-inner">
                            <div style="font-size:0.85rem; color:#aaa; margin-bottom:10px; font-weight:bold;"></div>
                            ${detailItemsHTML}
                        </div>
                    </div>
                </td>
            </tr>
        `;
    });

    list.innerHTML = finalHTML;
}