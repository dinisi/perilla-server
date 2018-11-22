const os = require("os");

module.exports = {
	apps: [{
		name: "Perilla",
		script: "dist/index.js",
		instances: Math.max(1, os.cpus().length - 1),
		autorestart: true,
		watch: false,
		max_memory_restart: "1G",
		env: {
			NODE_ENV: "development"
		},
		env_production: {
			NODE_ENV: "production"
		}
	},
	{
		name: "PerillaCron",
		script: "dist/cron/index.js",
		instances: 1,
		autorestart: true,
		watch: false,
		max_memory_restart: "1G",
		env: {
			NODE_ENV: "development"
		},
		env_production: {
			NODE_ENV: "production"
		}
	}]
};
