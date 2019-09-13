const neo = require("neo4j-driver").v1;
const queries = require("./queries");
const lib = require("./lib");

(async function () {

    const driver = neo.driver("bolt://localhost", neo.auth.basic("neo4j", "test"));
    try {
        await queries(driver, lib);
    }
    finally {
        driver.close();
    }

}());