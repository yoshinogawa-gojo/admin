// APIベースURL
const API_BASE_URL = 'https://yoshinogawa-admin-7tlyu7d2jq-an.a.run.app/api';

// メニューカラー定義
const MENU_COLORS = [
    '#ff6b35', '#28a745', '#dc3545', '#6f42c1', 
    '#20c997', '#fd7e14', '#007bff', '#ffc107'
];

// ユーティリティ関数
function getMenuColorByIndex(index) {
    return MENU_COLORS[index % MENU_COLORS.length];
}

function getMenuColor(menuName) {
    const menuNames = Object.keys(currentMenus || {});
    const index = menuNames.indexOf(menuName);
    return index >= 0 ? getMenuColorByIndex(index) : MENU_COLORS[MENU_COLORS.length - 1];
}

// グローバル変数
let currentUser = null;
let reservations = [];
let mailTemplates = {};
let currentMailRecipient = '';
let currentCustomerName = '';
let currentMenus = {};
let currentTemplates = {};
let currentDate = new Date();
let currentReservationDetail = null;
let holidays = [];
let notices = [];

// DOM要素の取得
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userIdInput = document.getElementById('user-id');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Auth] DOM読み込み完了');
    initializeEventListeners();
    checkLoginStatus();
});

// イベントリスナーの設定
function initializeEventListeners() {
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        loginBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin();
            }
        });
    }
    
    if (userIdInput) {
        userIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (passwordInput) passwordInput.focus();
            }
        });
    }
}

// ログイン状態チェック
function checkLoginStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showMainScreen();
    }
}

// ログイン処理
async function handleLogin() {
    if (loginBtn && loginBtn.disabled) return;
    
    hideError();
    const userId = userIdInput ? userIdInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!userId || !password) {
        showError('ユーザーIDとパスワードを入力してください');
        return;
    }

    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'ログイン中...';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, password: password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            currentUser = data.user_id;
            localStorage.setItem('currentUser', currentUser);
            showMainScreen();
            hideError();
            
            // リアルタイム更新を開始
            if (typeof startRealtimeUpdates === 'function') {
                startRealtimeUpdates();
            }
        } else {
            showError(data.error || 'ログインに失敗しました。IDまたはパスワードが間違っています。');
        }
    } catch (error) {
        console.error('[Auth] ログインエラー:', error);
        showError('ネットワークエラーが発生しました。接続を確認してください。');
    } finally {
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'ログイン';
        }
    }
}

// エラー表示
function showError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.classList.add('show');
        loginError.style.display = 'block';
        
        setTimeout(() => {
            hideError();
        }, 5000);
    } else {
        alert(message);
    }
}

// エラー非表示
function hideError() {
    if (loginError) {
        loginError.classList.remove('show');
        loginError.style.display = 'none';
        loginError.textContent = '';
    }
}

// ログアウト処理
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // リアルタイム更新を停止
    if (typeof stopRealtimeUpdates === 'function') {
        stopRealtimeUpdates();
    }
    
    showLoginScreen();
}

// メイン画面表示
function showMainScreen() {
    if (loginScreen) loginScreen.classList.add('hidden');
    if (mainScreen) mainScreen.classList.remove('hidden');
    
    // データ読み込み開始
    loadInitialData();
    
    // 手動更新ボタンを追加
    addManualRefreshButton();
    
    // 予約追加機能を初期化
    if (typeof initializeAddReservationFeature === 'function') {
        setTimeout(() => {
            initializeAddReservationFeature();
        }, 500);
    }
    
    // Firestore リスナーを初期化
    if (typeof initializeFirestoreListener === 'function') {
        setTimeout(() => {
            initializeFirestoreListener();
        }, 1000);
    }
    
    // サイネージ管理を初期化
    if (typeof loadCustomSettingsLocal === 'function') {
        setTimeout(() => {
            loadCustomSettingsLocal();
        }, 500);
    }
    
    // シフト管理を初期化
    if (typeof initializeShiftManagement === 'function') {
        setTimeout(() => {
            initializeShiftManagement();
        }, 500);
    }
}

// ログイン画面表示
function showLoginScreen() {
    if (mainScreen) mainScreen.classList.add('hidden');
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (userIdInput) userIdInput.value = '';
    if (passwordInput) passwordInput.value = '';
    hideError();
}

// 初期データ読み込み
async function loadInitialData() {
    try {
        console.log('[Auth] 初期データ読み込み開始');
        
        // メニューを先に読み込む
        await loadMenus();
        console.log('[Auth] メニュー読み込み完了');
        
        // 予約データを読み込み
        await loadReservations();
        console.log('[Auth] 予約読み込み完了');
        
        // その他のデータを並行読み込み
        await Promise.allSettled([
            loadMailTemplates(),
            loadHolidays(),
            loadNotices()
        ]);
        
        // カレンダー初期描画
        const calendarTab = document.getElementById('calendar-tab');
        if (calendarTab && calendarTab.classList.contains('active')) {
            setTimeout(() => {
                if (typeof renderCalendar === 'function') {
                    renderCalendar();
                }
                if (typeof renderMenuLegend === 'function') {
                    renderMenuLegend();
                }
            }, 200);
        }
        
        console.log('[Auth] 初期データ読み込み完了');
        
    } catch (error) {
        console.error('[Auth] 初期データ読み込みエラー:', error);
        alert('データの読み込みに失敗しました。手動更新ボタンで再試行してください。');
    }
}

// 予約データ読み込み
async function loadReservations() {
    try {
        console.log('[Auth] 予約データ読み込み開始');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('[Auth] 予約データ読み込みタイムアウト');
        }, 10000);
        
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
            reservations = data;
            console.log(`[Auth] 予約データ読み込み成功: ${data.length}件`);
            
            if (typeof displayReservations === 'function') {
                displayReservations();
            }
        } else {
            console.warn('[Auth] 予約データが配列ではありません:', typeof data);
            reservations = [];
        }
        
    } catch (error) {
        console.error('[Auth] 予約データ読み込みエラー:', error);
        reservations = [];
        
        if (error.name === 'AbortError') {
            console.error('[Auth] リクエストタイムアウト');
        }
        
        if (typeof displayReservations === 'function') {
            displayReservations();
        }
    }
}

// メニューデータ読み込み
async function loadMenus() {
    try {
        console.log('[Auth] メニューデータ読み込み開始');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/menus`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const menus = await response.json();
            currentMenus = menus || {};
            console.log(`[Auth] メニューデータ読み込み成功: ${Object.keys(currentMenus).length}個`);
            
            if (typeof displayMenus === 'function') {
                displayMenus(menus);
            }
            
            // カレンダーが表示されている場合は更新
            const calendarTab = document.getElementById('calendar-tab');
            if (calendarTab && calendarTab.classList.contains('active')) {
                setTimeout(() => {
                    if (typeof renderCalendar === 'function') {
                        renderCalendar();
                    }
                    if (typeof renderMenuLegend === 'function') {
                        renderMenuLegend();
                    }
                }, 50);
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('[Auth] メニューデータ読み込みエラー:', error);
        currentMenus = {};
    }
}

// 手動更新ボタンを追加
function addManualRefreshButton() {
    const navbar = document.querySelector('.navbar .nav-buttons');
    if (navbar && !document.getElementById('manual-refresh-btn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'manual-refresh-btn';
        refreshBtn.className = 'btn btn-secondary';
        refreshBtn.innerHTML = '🔄 更新';
        refreshBtn.title = 'データを手動で更新します';
        
        refreshBtn.addEventListener('click', async function() {
            this.disabled = true;
            this.innerHTML = '⏳ 更新中';
            
            try {
                await loadMenus();
                await loadReservations();
                
                if (typeof displayReservations === 'function') {
                    displayReservations();
                }
                
                const calendarTab = document.getElementById('calendar-tab');
                if (calendarTab && calendarTab.classList.contains('active')) {
                    if (typeof renderCalendar === 'function') {
                        renderCalendar();
                    }
                }
                
                this.innerHTML = '✓ 完了';
                setTimeout(() => {
                    this.innerHTML = '🔄 更新';
                    this.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('[Auth] 手動更新エラー:', error);
                this.innerHTML = '⚠ エラー';
                setTimeout(() => {
                    this.innerHTML = '🔄 更新';
                    this.disabled = false;
                }, 2000);
            }
        });
        
        navbar.insertBefore(refreshBtn, navbar.firstChild);
        console.log('[Auth] 手動更新ボタンを追加');
    }
}

// メールテンプレート読み込み
async function loadMailTemplates() {
    try {
        const response = await fetch(`${API_BASE_URL}/mail-templates`);
        mailTemplates = await response.json();
        if (typeof displayTemplates === 'function') {
            displayTemplates();
        }
    } catch (error) {
        console.error('[Auth] メールテンプレート読み込みエラー:', error);
    }
}

// 定休日読み込み
async function loadHolidays() {
    try {
        const response = await fetch(`${API_BASE_URL}/holidays`);
        const holidayData = await response.json();
        holidays = holidayData;
        if (typeof displayHolidays === 'function') {
            displayHolidays(holidayData);
        }
        
        const calendarTab = document.getElementById('calendar-tab');
        if (calendarTab && calendarTab.classList.contains('active') && typeof renderCalendar === 'function') {
            renderCalendar();
        }
    } catch (error) {
        console.error('[Auth] 定休日読み込みエラー:', error);
        holidays = [];
    }
}

// 重要なお知らせ読み込み
async function loadNotices() {
    try {
        const response = await fetch(`${API_BASE_URL}/notices`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.notices)) {
            notices = data.notices;
            if (typeof displayNotices === 'function') {
                displayNotices(notices);
            }
        } else {
            notices = [];
        }
    } catch (error) {
        console.error('[Auth] お知らせ読み込みエラー:', error);
        notices = [];
    }
}
