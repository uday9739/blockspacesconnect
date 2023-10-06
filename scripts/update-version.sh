#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "$0" )" &> /dev/null && pwd )
BASE_DIR=${SCRIPT_DIR}

if [ $(basename $SCRIPT_DIR) = "scripts" ]; then
  BASE_DIR=${BASE_DIR}/..
fi

BASE_DIR='.'
(cd ${BASE_DIR} && npm version --no-git-tag-version "$@")
(cd ${BASE_DIR}/core && npm version --no-git-tag-version "$@")
(cd ${BASE_DIR}/shared && npm version --no-git-tag-version "$@")
(cd ${BASE_DIR}/frontend/connect-ui && npm version --no-git-tag-version "$@")
