module.exports = { 
    runBatchScenario, 
    runScenario 
};

function displayRecord(record) {
    record.keys.filter(key => !key.startsWith("__X_")).forEach(key => {
        console.log(key, ":", record.get(key));
    });
}

async function runQuery(driver, match, returns) {
    const rnd = Math.random();
    const cmd = `MATCH ${match} RETURN ${rnd} as __X_cachebuster, ${returns}`;
    console.log(".");
    return await driver.session().run(cmd);
}

async function runBatchScenario(driver, matches, returns = "COUNT(DISTINCT da) as count") {

    console.log("---");
    console.log("Batch of", matches.length, "queries like", matches[0]);
    console.log("Warm up (2 x first of batch in series)");
    await runQuery(driver, matches[0], returns);
    await runQuery(driver, matches[0], returns);
    console.log("Sampling 1 iteration of batch in parallel");
    const promisedResults = matches.map(match => runQuery(driver, match, returns));
    const results = await Promise.all(promisedResults);
    results.forEach((result, i) => {
        console.log(i, matches[i]);
        result.records.forEach(displayRecord);
    });
    const consumed = results.reduce((prev, result) => prev + result.summary.resultConsumedAfter.low, 0) / results.length;
    const available = results.reduce((prev, result) => prev + result.summary.resultAvailableAfter.low, 0) / results.length;
    console.log("Consumed after", consumed);
    console.log("Available after", available);
    console.log("Sum both",Math.round(consumed+available));
}

async function runScenario(driver, match, returns = "COUNT(DISTINCT da) as count", sampleSize = 3) {

    console.log("---");
    console.log("Query", match);
    console.log("Warm up (2 in series)");
    await runQuery(driver, match, returns);
    await runQuery(driver, match, returns);
    console.log("Sampling 1 iteration of parallel queries. Parallel count:", sampleSize);
    const promisedResults = [];
    for(let i = 0; i < sampleSize; i++)
        promisedResults.push(runQuery(driver, match, returns));
    const results = await Promise.all(promisedResults);
    results[0].records.forEach(displayRecord);
    const consumed = results.reduce((prev, result) => prev + result.summary.resultConsumedAfter.low, 0) / results.length;
    const available = results.reduce((prev, result) => prev + result.summary.resultAvailableAfter.low, 0) / results.length;
    console.log("Consumed after", consumed);
    console.log("Available after", available);
    console.log("Sum both",Math.round(consumed+available));
}