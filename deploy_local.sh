#!/bin/bash

mkdir -p output
rm -rf output/*

function publish_webpack {
	webpack --progress --colors --config webpack.config.prod.js
	target_dir="output/dist"
	mkdir -p $target_dir
	cp dist/*.js $target_dir
}

function copy_static {
	cp -r public/* output
}

function copy_cname {
	echo "vr.5minlab.com" > output/CNAME
}

function dump_html {
	NODE_ENV=dist node server.js
}

publish_webpack
dump_html
copy_static
copy_cname
