const { default: axios } = require("axios")
const { addonBuilder } = require("stremio-addon-sdk")
const fs = require("fs")
// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.customlinks",
	"version": "0.0.1",
	"catalogs": [],
	"resources": ["stream"],
	"types": [
		"movie",
		"series"
	],
	"name": "custom-links",
	"description": "custom links",
	"idPrefixes": [
		"tt"
	]
}
const builder = new addonBuilder(manifest)

let streams = {}
let lastRefresh = 0
function refreshStreams() {
	axios.get("https://addon.aurelien-frettechambaud.workers.dev/").then(res =>{
		streams = res.data
		lastRefresh = Date.now()
		fs.writeFileSync("./streams.json", JSON.stringify(streams))
	})
	.catch(err => console.error(err))
}

builder.defineStreamHandler(async args => {
	console.log(args)
	if (Date.now() - lastRefresh > 1000 * 60) {
		refreshStreams()
	}
	if(streams[args.id]) {
		const stream = {url: streams[args.id].Link, behaviorHints: { notWebReady: true }}
		return Promise.resolve({ streams: [stream] })
	}else{
		return Promise.resolve({ streams: [] })
	}
})

module.exports = builder.getInterface()