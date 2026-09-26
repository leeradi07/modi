const firebaseConfig = {
  apiKey: "AIzaSyCAU48oolqtXv2Qsmvwz87NwJ2C4TDsGtI",
  authDomain: "modi-977fe.firebaseapp.com",
  projectId: "modi-977fe",
  storageBucket: "modi-977fe.firebasestorage.app",
  messagingSenderId: "503601929588",
  appId: "1:503601929588:web:5c07e62403d2a6ea6ba021",
  measurementId: "G-FH3Y1MMD4N"
};

const dbPromise = (async function() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js");
        const { initializeFirestore } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        const app = initializeApp(firebaseConfig);
        // 이 망에서는 Firestore 기본 전송(fetch 스트리밍)이 차단되어 SDK가
        // 'client is offline' 상태로 빠지고, 빈 캐시를 정상 응답처럼 돌려줍니다.
        // long polling + XHR 로 고정해야 서버 데이터를 읽습니다.
        return initializeFirestore(app, {
            experimentalForceLongPolling: true,
            useFetchStreams: false
        });
    } catch (e) {
        console.error("Firebase init error:", e);
        throw e;
    }
})();

class StorageService {
    async getDb() {
        return await dbPromise;
    }

    async savePlan(planData) {
        const db = await this.getDb();
        const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        
        const id = planData.id ? planData.id.toString() : Date.now().toString();
        const data = {
            ...planData,
            id: id,
            updatedAt: new Date().toISOString(),
            createdAt: planData.createdAt || new Date().toISOString()
        };

        await setDoc(doc(db, 'plans', id), data);
        return id;
    }

    async getAllPlans() {
        const db = await this.getDb();
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        
        const querySnapshot = await getDocs(collection(db, 'plans'));
        const plans = [];
        querySnapshot.forEach((docSnap) => {
            plans.push(docSnap.data());
        });
        
        return plans.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    async getPlanById(id) {
        const db = await this.getDb();
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        
        const docRef = doc(db, 'plans', id.toString());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such plan!");
            return null;
        }
    }

    async deletePlan(id) {
        const db = await this.getDb();
        const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
        
        await deleteDoc(doc(db, 'plans', id.toString()));
    }
}

window.platformStorageEngine = new StorageService();

