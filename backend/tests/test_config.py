from app.core.config import Settings


def test_bare_postgresql_url_gets_psycopg_driver():
    # Regression test: Render (and other managed Postgres hosts) hand out a
    # bare "postgresql://" URL with no driver. Without normalization,
    # SQLAlchemy defaults that to the psycopg2 dialect, which isn't
    # installed in this project -- crashing with
    # "ModuleNotFoundError: No module named 'psycopg2'" on startup.
    settings = Settings(database_url="postgresql://user:pass@host:5432/dbname")
    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/dbname"


def test_legacy_postgres_scheme_gets_psycopg_driver():
    # Some hosts (older Heroku-style) still emit "postgres://" rather than
    # "postgresql://".
    settings = Settings(database_url="postgres://user:pass@host:5432/dbname")
    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/dbname"


def test_url_with_explicit_driver_is_left_alone():
    settings = Settings(database_url="postgresql+psycopg://user:pass@host:5432/dbname")
    assert settings.database_url == "postgresql+psycopg://user:pass@host:5432/dbname"
