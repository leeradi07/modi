window.platformStorage = {
    savePlan: async (data) => {
        try {
            const storage = window.platformStorageEngine;
            // URL에 id가 있으면 수정(Update), 없으면 생성(Create)
            const urlParams = new URLSearchParams(window.location.search);
            const existingId = urlParams.get('id');
            if (existingId) {
                data.id = Number(existingId);
            }

            const id = await storage.savePlan(data);
            alert('플랫폼 데이터베이스에 성공적으로 저장되었습니다!');
            
            // 신규 저장인 경우 URL 업데이트
            if (!existingId) {
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('id', id);
                window.history.pushState({}, '', newUrl);
            }
            return id;
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다: ' + err);
        }
    },
    loadPlan: async (id) => {
        return await window.platformStorageEngine.getPlanById(id);
    }
};

// 페이지 로드 시 데이터 불러오기
window.addEventListener('DOMContentLoaded', async () => {
    const storage = window.platformStorageEngine;
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        if (!storage) {
            // storage.js가 아직 로드 안 됐을 수 있으므로 대기
            setTimeout(() => window.location.reload(), 100);
            return;
        }
        const data = await storage.getPlanById(id);
        if (data) {
            console.log('Loading existing plan:', data);
            if (window.injectPlatformData) {
                window.injectPlatformData(data);
            }
        }
    }
});

console.log('Platform Bridge Ready');
