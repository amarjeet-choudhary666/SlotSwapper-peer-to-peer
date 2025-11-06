package db

import (
	"context"
	"fmt"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB(cfg *config.Config) (*gorm.DB, error) {
	if cfg.DB_URL == "" {
		return nil, fmt.Errorf("db url is nil")
	}

	dbUrl := cfg.DB_URL
	ctx := context.Background()

	db, err := gorm.Open(postgres.Open(dbUrl), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxIdleTime(0)
	sqlDB.SetConnMaxLifetime(0)

	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto").Error; err != nil {
		return nil, fmt.Errorf("failed to create pgcrypto extension: %w", err)
	}

	if err := db.AutoMigrate(&models.User{}, &models.Event{}, &models.SwapRequest{}); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	DB = db
	fmt.Println("✅ PostgreSQL connected and migrated successfully")

	return db, nil
}
