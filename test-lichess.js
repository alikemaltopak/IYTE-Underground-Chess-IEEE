async function test() {
  const statusRes = await fetch(`https://lichess.org/api/game/5tNoditc`, { headers: { 'Accept': 'application/json' } });
  console.log("Game API:", statusRes.status, await statusRes.text());
}
test();
