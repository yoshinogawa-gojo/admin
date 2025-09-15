// 改善された予約追加機能のJavaScript（シンプル版）

// DOM要素
let addReservationModal = null;
let addReservationBtn = null;
let submitAddReservationBtn = null;
let cancelAddReservationBtn = null;
let addReservationDateInput = null;
let addReservationTimeInput = null;
let addReservationNameInput = null;
let addReservationPhoneInput = null;
let addReservationEmailInput = null;
let addReservationMenuSelect = null;
let addReservationPeopleInput = null;

// 重複処理防止フラグ
let isProcessingReservation = false;

// DOM要素を動的に取得する関数
function getAddReservationElements() {
    return {
        modal: document.getElementById('add-reservation-modal'),
        btn: document.getElementById('add-reservation-btn'),
        submitBtn: document.getElementById('submit-add-reservation-btn'),
        cancelBtn: document.getElementById('cancel-add-reservation-btn'),
        dateInput: document.getElementById('add-reservation-date'),
        timeInput: document.getElementById('add-reservation-time'),
        nameInput: document.getElementById('add-reservation-name'),
        phoneInput: document.getElementById('add-reservation-phone'),
        emailInput: document.getElementById('add-reservation-email'),
        menuSelect: document.getElementById('add-reservation-menu'),
        peopleInput: document.getElementById('add-reservation-people')
    };
}

// 初期化（複数回呼び出し対応）
function initializeAddReservationFeature() {
    console.log('[予約追加] 初期化開始');
    
    // DOM要素を取得
    const elements = getAddReservationElements();
    
    // グローバル変数に設定
    addReservationModal = elements.modal;
    addReservationBtn = elements.btn;
    submitAddReservationBtn = elements.submitBtn;
    cancelAddReservationBtn = elements.cancelBtn;
    addReservationDateInput = elements.dateInput;
    addReservationTimeInput = elements.timeInput;
    addReservationNameInput = elements.nameInput;
    addReservationPhoneInput = elements.phoneInput;
    addReservationEmailInput = elements.emailInput;
    addReservationMenuSelect = elements.menuSelect;
    addReservationPeopleInput = elements.peopleInput;
    
    console.log('[予約追加] DOM要素取得結果:', {
        modal: !!addReservationModal,
        btn: !!addReservationBtn,
        submitBtn: !!submitAddReservationBtn,
        cancelBtn: !!cancelAddReservationBtn,
        dateInput: !!addReservationDateInput,
        timeInput: !!addReservationTimeInput,
        nameInput: !!addReservationNameInput,
        phoneInput: !!addReservationPhoneInput,
        emailInput: !!addReservationEmailInput,
        menuSelect: !!addReservationMenuSelect,
        peopleInput: !!addReservationPeopleInput
    });
    
    // 既存のイベントリスナーを削除してから新しく設定
    if (addReservationBtn) {
        // 既存のイベントリスナーをクローンで削除
        const newBtn = addReservationBtn.cloneNode(true);
        addReservationBtn.parentNode.replaceChild(newBtn, addReservationBtn);
        addReservationBtn = newBtn;
        
        // 新しいイベントリスナーを設定
        addReservationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[予約追加] 予約追加ボタンがクリックされました');
            openAddReservationModal();
        });
        
        console.log('[予約追加] 予約追加ボタンにイベントリスナー設定完了');
    } else {
        console.error('[予約追加] 予約追加ボタンが見つかりません');
    }
    
    if (cancelAddReservationBtn) {
        cancelAddReservationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[予約追加] キャンセルボタンがクリックされました');
            closeAddReservationModal();
        });
    }
    
    if (submitAddReservationBtn) {
        // 既存のイベントリスナーをクリア
        const newSubmitBtn = submitAddReservationBtn.cloneNode(true);
        submitAddReservationBtn.parentNode.replaceChild(newSubmitBtn, submitAddReservationBtn);
        submitAddReservationBtn = newSubmitBtn;
        
        submitAddReservationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[予約追加] 送信ボタンがクリックされました');
            handleAddReservation();
        });
    }
    
    // モーダル外クリックで閉じる
    if (addReservationModal) {
        addReservationModal.addEventListener('click', function(e) {
            if (e.target === addReservationModal) {
                closeAddReservationModal();
            }
        });
    }
    
    console.log('[予約追加] 初期化完了');
}

// DOMContentLoaded での初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('[予約追加] DOMContentLoaded - 初期化実行');
    initializeAddReservationFeature();
});

// タブ切り替え時の初期化（カレンダータブ選択時）
document.addEventListener('click', function(event) {
    if (event.target && event.target.getAttribute('data-tab') === 'calendar') {
        console.log('[予約追加] カレンダータブ選択 - 初期化実行');
        setTimeout(() => {
            initializeAddReservationFeature();
        }, 200);
    }
});

// 予約追加モーダルを開く
function openAddReservationModal() {
    console.log('[予約追加] モーダルを開く');
    
    // DOM要素を再取得（動的生成の場合に対応）
    if (!addReservationModal) {
        const elements = getAddReservationElements();
        addReservationModal = elements.modal;
        addReservationDateInput = elements.dateInput;
        addReservationTimeInput = elements.timeInput;
        addReservationNameInput = elements.nameInput;
        addReservationPhoneInput = elements.phoneInput;
        addReservationEmailInput = elements.emailInput;
        addReservationMenuSelect = elements.menuSelect;
        addReservationPeopleInput = elements.peopleInput;
    }
    
    if (!addReservationModal) {
        console.error('[予約追加] モーダル要素が見つかりません');
        alert('予約追加画面を開けませんでした。ページを再読み込みしてください。');
        return;
    }
    
    // フォームをリセット
    resetAddReservationForm();
    
    // 今日の日付を設定
    if (addReservationDateInput) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        addReservationDateInput.value = todayString;
        
        console.log('[予約追加] 今日の日付を設定:', todayString);
    }
    
    // 現在時刻を設定
    if (addReservationTimeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(Math.ceil(now.getMinutes() / 15) * 15).padStart(2, '0'); // 15分単位に切り上げ
        const currentTime = `${hours}:${minutes}`;
        addReservationTimeInput.value = currentTime;
        
        console.log('[予約追加] 現在時刻を設定:', currentTime);
    }
    
    // メニューオプションを設定
    populateMenuOptions();
    
    // モーダル表示
    addReservationModal.classList.add('active');
    console.log('[予約追加] モーダル表示完了');
}

// 予約追加モーダルを閉じる
function closeAddReservationModal() {
    console.log('[予約追加] モーダルを閉じる');
    
    if (addReservationModal) {
        addReservationModal.classList.remove('active');
    }
    resetAddReservationForm();
}

// フォームをリセット
function resetAddReservationForm() {
    if (addReservationDateInput) addReservationDateInput.value = '';
    if (addReservationTimeInput) addReservationTimeInput.value = '';
    if (addReservationNameInput) addReservationNameInput.value = '';
    if (addReservationPhoneInput) addReservationPhoneInput.value = '';
    if (addReservationEmailInput) addReservationEmailInput.value = '';
    if (addReservationMenuSelect) addReservationMenuSelect.value = '';
    if (addReservationPeopleInput) addReservationPeopleInput.value = '1';
    
    isProcessingReservation = false;
    
    if (submitAddReservationBtn) {
        submitAddReservationBtn.disabled = false;
        submitAddReservationBtn.textContent = '予約追加';
        submitAddReservationBtn.style.backgroundColor = '#28a745';
        submitAddReservationBtn.style.cursor = 'pointer';
    }
}

// メニューオプションを設定
function populateMenuOptions() {
    console.log('[予約追加] メニューオプション設定開始');
    
    if (!addReservationMenuSelect) {
        console.error('[予約追加] メニューセレクト要素が見つかりません');
        return;
    }
    
    console.log('[予約追加] currentMenus確認:', {
        exists: !!currentMenus,
        type: typeof currentMenus,
        keys: currentMenus ? Object.keys(currentMenus) : 'なし'
    });
    
    // 初期化
    addReservationMenuSelect.innerHTML = '<option value="">座席タイプを選択してください</option>';
    
    // currentMenusが存在しない場合の対処
    if (!currentMenus || typeof currentMenus !== 'object') {
        console.warn('[予約追加] currentMenusが無効です。再読み込みを試行します...');
        
        if (typeof loadMenus === 'function') {
            loadMenus().then(() => {
                console.log('[予約追加] メニューデータ再読み込み完了。再度オプション設定を試行...');
                setTimeout(() => {
                    populateMenuOptions();
                }, 500);
            }).catch(error => {
                console.error('[予約追加] メニューデータ再読み込みエラー:', error);
                addFallbackMenuOptions();
            });
        } else {
            console.warn('[予約追加] loadMenus関数が見つかりません');
            addFallbackMenuOptions();
        }
        return;
    }
    
    const menuKeys = Object.keys(currentMenus);
    console.log('[予約追加] 利用可能なメニュー:', menuKeys);
    
    if (menuKeys.length === 0) {
        console.warn('[予約追加] メニューが登録されていません');
        addReservationMenuSelect.innerHTML = '<option value="">座席タイプが登録されていません</option>';
        return;
    }
    
    // メニューオプションを追加
    menuKeys.forEach(menuName => {
        try {
            const menu = currentMenus[menuName];
            if (!menu || typeof menu !== 'object') {
                console.warn(`[予約追加] 無効なメニューデータ: ${menuName}`, menu);
                return;
            }
            
            const option = document.createElement('option');
            option.value = menuName;
            
            const worktime = menu.worktime || '不明';
            option.textContent = `${menuName} - 収容人数${worktime}人`;
            addReservationMenuSelect.appendChild(option);
            
            console.log(`[予約追加] メニューオプション追加: ${menuName}`);
        } catch (error) {
            console.error(`[予約追加] メニューオプション追加エラー: ${menuName}`, error);
        }
    });
    
    console.log(`[予約追加] メニューオプション設定完了: ${menuKeys.length}個`);
}

// フォールバック用のデフォルトメニュー表示
function addFallbackMenuOptions() {
    console.log('[予約追加] フォールバックメニューオプションを設定');
    
    if (!addReservationMenuSelect) return;
    
    // デフォルトメニューを追加（実際のデータがない場合の応急処置）
    const fallbackMenus = [
        { name: 'VIP席', worktime: '4' },
        { name: 'カウンター席', worktime: '2' },
        { name: '一般席', worktime: '6' }
    ];
    
    addReservationMenuSelect.innerHTML = '<option value="">座席タイプを選択してください（フォールバック）</option>';
    
    fallbackMenus.forEach(menu => {
        const option = document.createElement('option');
        option.value = menu.name;
        option.textContent = `${menu.name} - 収容人数${menu.worktime}人`;
        addReservationMenuSelect.appendChild(option);
    });
    
    console.log('[予約追加] フォールバックメニュー設定完了');
}

// 電話番号のバリデーション
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^(0\d{1,4}-?\d{1,4}-?\d{4}|0\d{9,11})$/;
    const cleanPhone = phoneNumber.replace(/-/g, '');
    const cleanPhoneRegex = /^0\d{9,11}$/;
    
    return phoneRegex.test(phoneNumber) || cleanPhoneRegex.test(cleanPhone);
}

// メールアドレスのバリデーション
function validateEmail(email) {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 人数のバリデーション
function validatePeopleCount(peopleCount) {
    const count = parseInt(peopleCount);
    return !isNaN(count) && count > 0 && count <= 100;
}

// 時間のバリデーション
function validateTime(timeString) {
    if (!timeString) return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return timeRegex.test(timeString);
}

// 予約番号生成
function generateReservationNumber() {
    return Math.floor(Math.random() * 90000000) + 10000000;
}

// 予約追加処理（重複処理防止版・シンプル版）
async function handleAddReservation() {
    console.log('[予約追加] 予約追加処理開始');
    
    // 重複処理防止
    if (isProcessingReservation) {
        console.log('[予約追加] 処理中のため重複実行を防止');
        return;
    }
    
    isProcessingReservation = true;
    
    // フォームの値を取得
    const date = addReservationDateInput ? addReservationDateInput.value : '';
    const time = addReservationTimeInput ? addReservationTimeInput.value : '';
    const name = addReservationNameInput ? addReservationNameInput.value.trim() : '';
    const phone = addReservationPhoneInput ? addReservationPhoneInput.value.trim() : '';
    const email = addReservationEmailInput ? addReservationEmailInput.value.trim() : '';
    const menuName = addReservationMenuSelect ? addReservationMenuSelect.value : '';
    const peopleCount = addReservationPeopleInput ? addReservationPeopleInput.value.trim() : '1';
    
    console.log('[予約追加] フォーム値確認:', {
        date: date,
        time: time,
        name: name,
        phone: phone,
        email: email,
        menuName: menuName,
        peopleCount: peopleCount
    });
    
    // バリデーション
    if (!date || !time || !name || !menuName || !peopleCount) {
        alert('必須項目をすべて入力してください。\n（電話番号・メールアドレスは任意です）');
        isProcessingReservation = false;
        return;
    }
    
    // 日付形式チェック
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        alert('日付の形式が正しくありません（YYYY-MM-DD形式で入力してください）');
        isProcessingReservation = false;
        return;
    }
    
    // 時間形式チェック
    if (!validateTime(time)) {
        alert('時間の形式が正しくありません（HH:MM形式で入力してください）');
        isProcessingReservation = false;
        return;
    }
    
    // 人数バリデーション
    if (!validatePeopleCount(peopleCount)) {
        alert('人数は1〜100の数値で入力してください。');
        isProcessingReservation = false;
        return;
    }
    
    // 電話番号とメールアドレスのバリデーション
    if (phone && !validatePhoneNumber(phone)) {
        alert('正しい電話番号を入力してください。\n（例：090-1234-5678 または 09012345678）');
        isProcessingReservation = false;
        return;
    }
    
    if (!validateEmail(email)) {
        alert('正しいメールアドレスを入力してください。');
        isProcessingReservation = false;
        return;
    }
    
    // 選択されたメニューの詳細を取得
    let selectedMenu = null;
    
    if (currentMenus && typeof currentMenus === 'object') {
        selectedMenu = currentMenus[menuName];
    }
    
    // フォールバック用のメニューデータ
    if (!selectedMenu) {
        console.warn('[予約追加] currentMenusからメニューが見つかりません。フォールバックデータを使用');
        
        const fallbackMenus = {
            'VIP席': { worktime: 4, fare: 8000 },
            'カウンター席': { worktime: 2, fare: 5000 },
            '一般席': { worktime: 6, fare: 3000 }
        };
        
        selectedMenu = fallbackMenus[menuName];
        
        if (!selectedMenu) {
            selectedMenu = {
                worktime: 4,
                fare: 5000
            };
            console.warn(`[予約追加] メニュー「${menuName}」が見つかりません。デフォルト値を使用します`);
        }
    }
    
    console.log('[予約追加] 使用するメニューデータ:', { menuName, selectedMenu });
    
    // 送信ボタンを無効化（視覚的フィードバック改善）
    if (submitAddReservationBtn) {
        submitAddReservationBtn.disabled = true;
        submitAddReservationBtn.textContent = '📝 予約追加中...';
        submitAddReservationBtn.style.backgroundColor = '#6c757d';
        submitAddReservationBtn.style.cursor = 'not-allowed';
    }
    
    try {
        const reservationNumber = generateReservationNumber();
        
        // メール欄と電話番号欄の設定
        let mailField = email || '管理者追加';
        let phoneField = phone || '管理者追加';
        
        // 予約データを作成
        const reservationData = {
            reservationNumber: reservationNumber,
            Menu: menuName,
            "Name-f": name,
            "Name-s": phoneField,
            Time: time,
            WorkTime: parseInt(peopleCount),
            date: date,
            mail: mailField,
            states: 0,
            adminAdded: true,
            addedAt: new Date().toISOString()
        };
        
        console.log('[予約追加] 予約データ:', reservationData);
        
        // API呼び出し
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Admin-Override': 'true'
            },
            body: JSON.stringify({
                ...reservationData,
                adminOverride: true
            })
        });
        
        // レスポンステキストを取得
        const responseText = await response.text();
        console.log('[予約追加] レスポンステキスト:', responseText.substring(0, 200));
        
        // HTMLレスポンスかチェック
        if (responseText.startsWith('<!doctype') || responseText.startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
            throw new Error('API_ENDPOINT_NOT_FOUND');
        }
        
        // JSONとして解析
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('[予約追加] JSON解析エラー:', parseError);
            throw new Error('INVALID_JSON_RESPONSE');
        }
        
        if (!response.ok) {
            throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`);
        }
        
        if (result.success) {
            // 成功メッセージを準備
            const successMessage = `✅ 予約を追加しました\n\n予約番号: ${reservationNumber}\n日時: ${date} ${time}\nお客様: ${name}\n人数: ${peopleCount}人\n座席: ${menuName}`;
            
            // 成功時のボタン表示
            if (submitAddReservationBtn) {
                submitAddReservationBtn.textContent = '✅ 追加完了！';
                submitAddReservationBtn.style.backgroundColor = '#28a745';
                submitAddReservationBtn.style.color = '#ffffff';
            }
            
            // 成功メッセージを表示
            setTimeout(() => {
                alert(successMessage);
                
                // モーダルを閉じる
                closeAddReservationModal();
                
                // 後続処理は非同期で実行（UIブロックを防ぐ）
                setTimeout(async () => {
                    try {
                        // 予約データを再読み込み
                        if (typeof loadReservations === 'function') {
                            await loadReservations();
                        }
                        
                        // カレンダーを再描画
                        const calendarTab = document.getElementById('calendar-tab');
                        if (calendarTab && calendarTab.classList.contains('active') && typeof renderCalendar === 'function') {
                            renderCalendar();
                        }
                    } catch (updateError) {
                        console.error('[予約追加] 画面更新エラー:', updateError);
                    }
                }, 500);
                
            }, 1000);
            
            console.log('[予約追加] 予約が正常に追加されました:', reservationData);
            
        } else {
            throw new Error(result.message || '予約の追加に失敗しました');
        }
        
    } catch (error) {
        console.error('[予約追加] 予約追加エラー:', error);
        
        let errorMessage = '予約の追加に失敗しました。';
        
        // エラータイプ別の処理
        if (error.message === 'API_ENDPOINT_NOT_FOUND') {
            errorMessage = `🔌 APIサーバーに接続できません\n\n考えられる原因:\n• サーバーのURLが間違っている\n• APIサーバーがダウンしている\n• ネットワーク設定の問題\n\n📞 システム管理者にお問い合わせください。`;
        } else if (error.message === 'INVALID_JSON_RESPONSE') {
            errorMessage = '🔧 サーバーから無効な応答が返されました。\n📞 システム管理者にお問い合わせください。';
        } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            errorMessage = `🌐 ネットワークエラーが発生しました\n\n📡 ネットワーク接続を確認するか、\n⏰ しばらく時間をおいてから再度お試しください。`;
        } else if (error.message.includes('404')) {
            errorMessage = '🔍 APIエンドポイントが見つかりません（404エラー）。\n📞 URL設定を確認してください。';
        } else if (error.message.includes('500')) {
            errorMessage = '⚠️ サーバー内部エラーが発生しました（500エラー）。\n⏰ しばらく時間をおいてから再度お試しください。';
        } else if (error.message) {
            errorMessage += '\n\n詳細: ' + error.message;
        }
        
        alert(errorMessage);
        
    } finally {
        // 送信ボタンを再有効化
        if (submitAddReservationBtn) {
            submitAddReservationBtn.disabled = false;
            submitAddReservationBtn.textContent = '予約追加';
            submitAddReservationBtn.style.backgroundColor = '#28a745';
            submitAddReservationBtn.style.cursor = 'pointer';
        }
        
        // 処理完了フラグをリセット
        isProcessingReservation = false;
    }
}

// グローバル関数として公開
window.initializeAddReservationFeature = initializeAddReservationFeature;
window.openAddReservationModal = openAddReservationModal;
