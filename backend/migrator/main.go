package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

const (
	dialect = "pgx"
)

var (
	flags = flag.NewFlagSet("migrate", flag.ExitOnError)
	dir   = flags.String("dir", "migrations", "directory with migration files")
)

func main() {
	dbString := os.Getenv("DATABASE_URL")
	if dbString == "" {
		dbString = buildDatabaseURLFromEnv()
		log.Printf("Using constructed DATABASE_URL: %s\n", dbString)
	}

	flags.Usage = usage
	flags.Parse(os.Args[1:])

	args := flags.Args()
	if len(args) == 0 || args[0] == "-h" || args[0] == "--help" {
		flags.Usage()
		return
	}

	command := args[0]

	db, err := goose.OpenDBWithDriver(dialect, dbString)
	if err != nil {
		log.Fatal(err.Error())
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Print(err.Error())
		}
	}()

	if err := goose.RunContext(context.Background(), command, db, *dir, args[1:]...); err != nil {
		log.Fatalf("migrate %v: %v", command, err)
	}
}

func buildDatabaseURLFromEnv() string {
	host := getEnvOrDefault("PGHOST", "localhost")
	port := getEnvOrDefault("PGPORT", "5432")
	user := getEnvOrDefault("PGUSER", "postgres")
	password := os.Getenv("PGPASSWORD")
	dbname := getEnvOrDefault("PGDATABASE", "postgres")
	sslmode := getEnvOrDefault("DB_SSLMODE", "disable")

	if password != "" {
		return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
			user, password, host, port, dbname, sslmode)
	}
	return fmt.Sprintf("postgres://%s@%s:%s/%s?sslmode=%s",
		user, host, port, dbname, sslmode)
}

func getEnvOrDefault(key, def string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return def
}

func usage() {
	fmt.Println(usagePrefix)
	flags.PrintDefaults()
	fmt.Println(usageCommands)
}

var (
	usagePrefix = `Usage: migrate COMMAND
Examples:
    migrate status
`

	usageCommands = `
Commands:
    up                   Migrate the DB to the most recent version available
    up-by-one            Migrate the DB up by 1
    up-to VERSION        Migrate the DB to a specific VERSION
    down                 Roll back the version by 1
    down-to VERSION      Roll back to a specific VERSION
    redo                 Re-run the latest migration
    reset                Roll back all migrations
    status               Dump the migration status for the current DB
    version              Print the current version of the database
    create NAME [sql|go] Creates new migration file with the current timestamp
    fix                  Apply sequential ordering to migrations`
)
