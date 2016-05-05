({
    baseUrl: ".",
    mainConfigFile: 'main.js',
    wrapShim: true,
    paths: {
        'jquery': "empty:",
        "jquery-ui": "empty:",
        "bootstrap": "empty:",
        "spin": "empty:",

		"angular": "empty:",
		"ngAnimate": "empty:",
		"ngRoute": "empty:",
		"ngTranslate": "empty:",
		"ngComplete": "empty:"
    },
    name: "main",
    out: "dist.min.js",

})