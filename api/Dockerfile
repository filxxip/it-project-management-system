FROM python:3.11-slim

RUN apt-get update && apt-get install -y redis-server

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN sed -i 's/^bind 127.0.0.1 ::1/bind 0.0.0.0/' /etc/redis/redis.conf

ENV FLASK_APP=api.py
ENV FLASK_RUN_HOST=0.0.0.0

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 5000 6379

CMD ["/entrypoint.sh"]
