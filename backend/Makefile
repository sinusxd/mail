VENV_DIR=./.venv
ALEMBIC=$(VENV_DIR)/bin/alembic

help:
	@echo "  Доступные команды:"
	@echo "  make upgrade           — применить миграции (upgrade head)"
	@echo "  make downgrade STEP=n  — откатить миграции на n шагов"
	@echo "  make revision name=MSG — создать ревизию с комментарием"
	@echo "  make current           — показать текущую версию"
	@echo "  make history           — показать историю миграций"


upgrade:
	$(ALEMBIC) upgrade head

downgrade:
	$(ALEMBIC) downgrade -1

revision:
	$(ALEMBIC) revision --autogenerate -m "$(name)"

current:
	$(ALEMBIC) current

history:
	$(ALEMBIC) history

check-alembic:
	@if [ ! -f "$(ALEMBIC)" ]; then \
		echo "Alembic не найден по пути $(ALEMBIC). Активируй venv или проверь путь!"; \
		exit 1; \
	fi

upgrade: check-alembic
downgrade: check-alembic
revision: check-alembic
current: check-alembic
history: check-alembic
