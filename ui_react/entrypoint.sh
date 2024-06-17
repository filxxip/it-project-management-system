#!/bin/sh

envsubst '$BACKEND_HOST' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"
