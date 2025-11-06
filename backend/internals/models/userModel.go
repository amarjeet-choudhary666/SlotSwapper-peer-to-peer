package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint    `gorm:"primaryKey"`
	Name      string  `gorm:"not null"`
	Email     string  `gorm:"uniqueIndex;not null"`
	Password  string  `gorm:"not null"`
	RefreshToken string
	Events    []Event `gorm:"foreignKey:OwnerID"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}
