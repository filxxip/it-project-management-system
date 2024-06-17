#!/bin/bash

redis-server /etc/redis/redis.conf &

python3 api.py
