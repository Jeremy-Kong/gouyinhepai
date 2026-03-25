#!/usr/bin/env bash
set -a
source /home/ubuntu/douyinhepai/explore-proxy/.env
set +a
exec /usr/bin/node /home/ubuntu/douyinhepai/explore-proxy/server.js
