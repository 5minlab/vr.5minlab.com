#!/bin/bash


git clone git@github.com:5minlab/vr.5minlab.com.git gh-pages --branch gh-pages

rm -rf gh-pages/*
ls -al gh-pages

./deploy_local.sh
cp -r output/* gh-pages

cd gh-pages
git add -f .
diff_line=$(git status -s|wc -l)
if [[ $diff_line == "0" ]]; then
	echo "there is no changes, do not commit"
else
	git commit -a -m "add new site content"
	git push origin gh-pages
fi
