FROM postgres:latest

# Establecer variables de entorno desde el .env
ENV POSTGRES_DB=nube_local \
    POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=admin

# Exponer el puerto de PostgreSQL
EXPOSE 5432

# Comando de inicio del contenedor
CMD ["postgres"]
