# syntax=docker/dockerfile:1

FROM python:3.9-slim
ARG DEBIAN_FRONTEND=noninteractive

# Устанавливаем рабочую директорию
WORKDIR /code

# Устанавливаем зависимости системы
RUN apt update && apt -y install --no-install-recommends \
    python3 python3-pip curl libpq-dev && \
    apt clean && rm -rf /var/lib/apt/lists/*

# Копируем файл зависимостей
COPY requirements.txt /code/

# Устанавливаем зависимости Python
RUN pip install --no-cache-dir -r requirements.txt

# Копируем оставшиеся файлы
COPY . /code/

# Устанавливаем переменные окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/code

# Открываем порт
EXPOSE 8000

# Запускаем приложение
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
