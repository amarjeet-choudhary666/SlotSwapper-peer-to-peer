package services

import (
	"errors"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/db"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/models"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
)

func CreateUser(input *models.User) (*models.User, error) {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}
	var existing models.User
	if err := db.DB.Where("email = ?", input.Email).First(&existing).Error; err == nil {
		logger.Warn("Attempt to create user with existing email: " + input.Email)
		return nil, errors.New("email already exists")
	}

	if err := db.DB.Create(input).Error; err != nil {
		logger.Error("Failed to create user in database: " + err.Error())
		return nil, err
	}

	logger.Info("User created in database with email: " + input.Email)
	return input, nil
}

func GetUserByEmail(email string) (*models.User, error) {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}
	var user models.User
	if err := db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

func GetEmailByID(id uint) (*models.User, error) {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}

	var user models.User

	if err := db.DB.First(&user, id).Error; err != nil {
		return nil, errors.New("user not found")
	}

	return &user, nil
}

func UpdateUser(user *models.User) error {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return errors.New("database connection is nil")
	}
	if err := db.DB.Save(user).Error; err != nil {
		return err
	}
	return nil
}
