module.exports = () => {
    return {
        extensions: [
            "ts"
        ],
        require: [
            "ts-node/register"
        ],
        files: [
            "src/tests/*",
        ],
        timeout: "2m",
        verbose: true,
        concurrency: 1,
        environmentVariables: {
            "GCP_PROJECT": "awake-d48d9",
            "TEST_MODE": "TRUE", 
            "NODE_ENV": "dev"
        },
    }
}