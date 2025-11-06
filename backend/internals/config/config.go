package config

import (
	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

type Config struct {
	PORT                 string
	DB_URL               string
	ACCESS_TOKEN_SECRET  string
	REFRESH_TOKEN_SECRET string
}

func LoadConfig() *Config {
	godotenv.Load()

	viper.AutomaticEnv()

	config := &Config{
		PORT:                 viper.GetString("PORT"),
		DB_URL:               viper.GetString("DATABASE_URL"),
		ACCESS_TOKEN_SECRET:  viper.GetString("ACCESS_TOKEN_SECRET"),
		REFRESH_TOKEN_SECRET: viper.GetString("REFRESH_TOKEN_SECRET"),
	}

	return config
}
