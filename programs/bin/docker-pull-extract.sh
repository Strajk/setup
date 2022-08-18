#!/bin/bash -e

# Inspired by https://github.com/redhat-developer/codeready-workspaces/blob/crw-2-rhel-8/product/containerExtract.sh

url=$1

# if the url is not provided, exit
if [ -z "$url" ]; then
  echo "Provide a url to pull and extract"
  exit 1
fi

name=dockerPullAndExtractTmp

echo ""
echo "CLEANING UP PREVIOUS DOCKER IMAGE & CONTAINER"
echo "============================================="
# `|| true` = Do not fail if the container does not exist
docker rm --force "$name" || true

echo ""
echo "PULLING DOCKER IMAGE"
echo "===================="
# `2>&1` = redirect stderr to stdout
docker pull "$url" 2>&1

echo ""
echo "CREATING CONTAINER FROM IMAGE"
echo "============================="
docker create --platform linux/amd64 --name="$name" "$url" 2>&1

echo ""
echo "EXPORTING CONTAINER TO TAR"
echo "==========================="
docker export "$name" > "${name}.tar"

echo ""
echo "EXTRACTING CONTAINER"
echo "===================="
mkdir unpacked
tar --extract \
  --checkpoint=.100 \
  --verbose \
  --file "${name}.tar" \
  --directory unpacked

echo ""
echo "CLEANING UP"
echo "==========="

echo "TODO"
