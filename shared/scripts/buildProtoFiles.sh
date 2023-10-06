#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd "${BASEDIR}"/../

PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
GRPC_TOOLS_NODE_PROTOC_PLUGIN="./node_modules/.bin/grpc_tools_node_protoc_plugin"
GRPC_TOOLS_NODE_PROTOC="./node_modules/.bin/grpc_tools_node_protoc"

for f in ./proto/*/; do

  # skip the non proto files
  if [ "$(basename "$f")" == "index.ts" ]; then
      continue
  fi
  ${GRPC_TOOLS_NODE_PROTOC} \
      -I "${f}" \
    --plugin=protoc-gen-ts=${PROTOC_GEN_TS_PATH} \
    --plugin=protoc-gen-grpc=${GRPC_TOOLS_NODE_PROTOC_PLUGIN} \
    --js_out=import_style=commonjs:"${f}" \
    --grpc_out=grpc_js:"${f}" \
    --ts_out=grpc_js:"${f}" \
      "${f}"/*.proto
done
