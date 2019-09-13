module.exports = async function(driver, { runScenario, runBatchScenario }) { //eslint-disable-line no-unused-vars

    // run MATCH 3 times, returning COUNT(DISTINCT x)
    await runScenario(driver, "(x:Actor)-[]->(:Movie)");

    // run a batch of commands
    await runBatchScenario(driver, [...Array(20)].map((_,i) => `(x:Actor)-[]-(:Movie) WHERE x.chunk = ${i}`));
    
    // run MATCH 3 times, returning the specified RETURN
    await runScenario(driver, "(actor:Actor)-[]->(movie:Movie)", "COUNT(DISTINCT actor) as ActorCount, COUNT(DISTINCT movie) as MovieCount");

    // run MATCH 15 times
    await runScenario(driver, "(actor:Actor)-[]->(:Movie)", null, 15);
    
}