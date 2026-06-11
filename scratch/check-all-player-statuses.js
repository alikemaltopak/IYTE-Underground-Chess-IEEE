async function run() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/iyte-satranc-ieee/databases/(default)/documents/players?pageSize=100");
  const data = await res.json();
  
  const players = data.documents || [];
  console.log("Total players in DB:", players.length);
  
  players.forEach(p => {
    console.log(`- Codename: ${p.fields.codename?.stringValue || 'N/A'}, Status: ${p.fields.status?.stringValue || 'N/A'}, Wins: ${p.fields.wins?.integerValue || 0}, Losses: ${p.fields.losses?.integerValue || 0}`);
  });
}
run();
