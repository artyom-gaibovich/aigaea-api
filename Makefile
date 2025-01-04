
all:
	npx nx run-many --parallel=10 --target=serve


create-migration:
	@echo "Starting migration..."
	npx prisma migrate dev --create-only

apply-migration:
	@echo "Apply migrations..."
	npx prisma migrate deploy

uploads:
	mkdir uploads