async function test() {
  const res = await fetch('https://lichess.org/api/challenge/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ 'clock.limit': '600', 'clock.increment': '5', 'name': 'Test' })
  });
  const data = await res.json();
  console.log("Challenge:", data.challenge.id);
  
  // Try to export the game immediately
  const exportRes = await fetch(`https://lichess.org/game/export/${data.challenge.id}`, { headers: { 'Accept': 'application/json' } });
  console.log("Export immediately:", exportRes.status);
}
test();
