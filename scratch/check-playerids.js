async function run() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/iyte-satranc-ieee/databases/(default)/documents/tournament/current");
  const data = await res.json();
  
  const playerIds = data.fields.playerIds?.arrayValue?.values?.map(v => v.stringValue) || [];
  console.log("playerIds count in tournament/current document:", playerIds.length);
  console.log("playerIds list:", playerIds);
}
run();
