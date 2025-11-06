package models

import (
	"time"

	"gorm.io/gorm"
)

type EventStatus string

const (
	EventStatusBusy        EventStatus = "BUSY"
	EventStatusSwappable   EventStatus = "SWAPPABLE"
	EventStatusSwapPending EventStatus = "SWAP_PENDING"
)

type UpdateEventInput struct {
	Title     *string `json:"title,omitempty"`
	StartTime *string `json:"startTime,omitempty"`
	EndTime   *string `json:"endTime,omitempty"`
	Status    *string `json:"status,omitempty"`
}

type Event struct {
	ID        uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	Title     string      `gorm:"type:varchar(255);not null" json:"title"`
	StartTime time.Time   `gorm:"not null" json:"startTime"`
	EndTime   time.Time   `gorm:"not null" json:"endTime"`
	Status    EventStatus `gorm:"type:varchar(20);not null;default:BUSY" json:"status"`

	OwnerID uint `gorm:"not null" json:"ownerId"`
	Owner   User `gorm:"foreignKey:OwnerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"owner,omitempty"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt,omitempty"`
}
