@echo off

SETLOCAL
SET basedir=%~dp0..\

for %%x in ("%basedir%") do (
  set basedir=%%~dpx
)

SET PROTOC_GEN_TS_PATH=%basedir%\node_modules\.bin\protoc-gen-ts.cmd
SET GRPC_TOOLS_NODE_PROTOC_PLUGIN=%basedir%\node_modules\.bin\grpc_tools_node_protoc_plugin.cmd
SET GRPC_TOOLS_NODE_PROTOC=%basedir%\node_modules\.bin\grpc_tools_node_protoc.cmd

SET proto_dir=%basedir%proto\connect\

"%GRPC_TOOLS_NODE_PROTOC%"^
 -I %proto_dir%^
 --plugin=protoc-gen-ts="%PROTOC_GEN_TS_PATH%"^
 --plugin=protoc-gen-grpc="%GRPC_TOOLS_NODE_PROTOC_PLUGIN%"^
 --js_out=import_style=commonjs:%proto_dir%^
 --grpc_out=grpc_js:%proto_dir%^
 --ts_out=grpc_js:%proto_dir%^
 "%proto_dir%*.proto"
