import fetch from 'node-fetch';

async function testLichessAPI() {
  console.log("=== 1. YENİ HAYALET MAÇ OLUŞTURULUYOR ===");
  try {
    const createRes = await fetch('http://localhost:3001/api/create-match', { method: 'POST' });
    const matchData = await createRes.json();
    console.log("Maç Oluşturma Sonucu:", matchData);

    if (matchData.success) {
      console.log("\n-> Maç ID:", matchData.matchId);
      console.log("-> Beyaz Oyuncu Linki:", matchData.urlWhite);
      console.log("-> Siyah Oyuncu Linki:", matchData.urlBlack);
      
      console.log("\nLütfen yukarıdaki linklerden birini tarayıcıda açıp maçı başlatın/bitirin.");
      console.log("Maç bittikten sonra sonucu kontrol etmek için şu komutu çalıştırabilirsiniz:");
      console.log(`curl http://localhost:3001/api/match-result/${matchData.matchId}`);
      
      console.log("\n=== 2. MAÇ DURUMU (ŞU AN) ===");
      const statusRes = await fetch(`http://localhost:3001/api/match-result/${matchData.matchId}`);
      const statusData = await statusRes.json();
      console.log("Maç Durumu:", statusData);
    }
  } catch (err) {
    console.error("Test başarısız:", err.message);
  }
}

testLichessAPI();
