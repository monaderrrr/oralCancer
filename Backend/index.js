console.log("index.js: starting");
import bootstrap from "./src/main.js";

// Global handlers to log crashes and avoid silent exits
process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

(async () => {
	console.log("index.js: calling bootstrap");
	try {
		await bootstrap();
		console.log("index.js: bootstrap finished");
	} catch (err) {
		console.error("Bootstrap failed:", err);
	}
})();
