package models

import (
	"time"
)

type SwapStatus string

const (
	PENDING  SwapStatus = "PENDING"
	ACCEPTED SwapStatus = "ACCEPTED"
	REJECTED SwapStatus = "REJECTED"
)

type SwapRequest struct {
	ID               uint       `gorm:"primaryKey"`
	RequesterID      uint       `gorm:"not null"`
	Requester        User       `gorm:"foreignKey:RequesterID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ResponderID      uint       `gorm:"not null"`
	Responder        User       `gorm:"foreignKey:ResponderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	RequesterEventID uint       `gorm:"not null"`
	RequesterEvent   Event      `gorm:"foreignKey:RequesterEventID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	ResponderEventID uint       `gorm:"not null"`
	ResponderEvent   Event      `gorm:"foreignKey:ResponderEventID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	Status           SwapStatus `gorm:"type:varchar(20);not null;default:'PENDING'"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
}
type SwapRequestInput struct {
	MySlotID    uint `json:"my_slot_id" binding:"required"`
	TheirSlotID uint `json:"their_slot_id" binding:"required"`
}
