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
	cp -r img output
	cp -r scene.json output
}

function copy_cname {
	echo "vr.5minlab.com" > output/CNAME
}

function dump_html {
	NODE_ENV=production npm run server &
	PID=$!
	echo "server pid : $PID"

	host="http://op-haruna.5ml.io:3001"

	for i in {1..60}; do
		output=$(curl $host/test/ -s)
		if [[ $output == "" ]]; then
			echo "server is launching... $i"
			sleep 1
		else
			break
		fi
	done

	urls=(
		"/"
	)
	for url in ${urls[@]}; do
		mkdir -p output/$url
		curl $host$url -s > output/$url/index.html
	done

	kill -9 $PID
	echo "kill $PID"
}

publish_webpack
dump_html
copy_static
copy_cname
