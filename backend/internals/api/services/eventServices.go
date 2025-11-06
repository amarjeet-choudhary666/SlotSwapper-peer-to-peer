package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/db"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/models"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
)

func CreateEvent(input *models.Event) (*models.Event, error) {
	if err := db.DB.Create(input).Error; err != nil {
		logger.Error("Failed to create event in database: " + err.Error())
		return nil, err
	}

	logger.Info("Event created in database with title: " + input.Title)
	return input, nil
}

func GetUserEvents(userID uint) ([]models.Event, error) {
	var events []models.Event
	if err := db.DB.Where("owner_id = ?", userID).Find(&events).Error; err != nil {
		logger.Error("Failed to fetch user events: " + err.Error())
		return nil, err
	}

	return events, nil
}

func UpdateEvent(eventID uint, userID uint, input *models.Event) (*models.Event, error) {
	var event models.Event
	if err := db.DB.Where("id = ? AND owner_id = ?", eventID, userID).First(&event).Error; err != nil {
		logger.Error("Event not found or not owned by user: " + err.Error())
		return nil, errors.New("event not found")
	}

	if event.Status == models.EventStatusSwapPending {
		logger.Error("Cannot update event while swap request is pending")
		return nil, errors.New("cannot update event while swap request is pending")
	}

	event.Title = input.Title
	event.StartTime = input.StartTime
	event.EndTime = input.EndTime
	event.Status = input.Status

	if err := db.DB.Save(&event).Error; err != nil {
		logger.Error("Failed to update event: " + err.Error())
		return nil, err
	}

	logger.Info("Event updated with ID: " + string(rune(eventID)))
	return &event, nil
}

func UpdateEventPartial(eventID uint, userID uint, input *models.UpdateEventInput) (*models.Event, error) {
	var event models.Event
	if err := db.DB.Where("id = ? AND owner_id = ?", eventID, userID).First(&event).Error; err != nil {
		logger.Error("Event not found or not owned by user: " + err.Error())
		return nil, errors.New("event not found")
	}

	if event.Status == models.EventStatusSwapPending {
		logger.Error("Cannot update event while swap request is pending")
		return nil, errors.New("cannot update event while swap request is pending")
	}

	if input.Title != nil {
		event.Title = *input.Title
	}
	if input.StartTime != nil {
		startTime, err := time.Parse(time.RFC3339, *input.StartTime)
		if err != nil {
			return nil, errors.New("invalid start time format")
		}
		event.StartTime = startTime
	}
	if input.EndTime != nil {
		endTime, err := time.Parse(time.RFC3339, *input.EndTime)
		if err != nil {
			return nil, errors.New("invalid end time format")
		}
		event.EndTime = endTime
	}
	if input.Status != nil {
		logger.Info(fmt.Sprintf("Updating event %d status from %s to %s", eventID, event.Status, *input.Status))
		event.Status = models.EventStatus(*input.Status)
	}

	logger.Info(fmt.Sprintf("About to save event %d with status: %s", eventID, event.Status))

	if err := db.DB.Save(&event).Error; err != nil {
		logger.Error("Failed to update event: " + err.Error())
		return nil, err
	}

	logger.Info(fmt.Sprintf("Event %d successfully saved to database with status: %s", eventID, event.Status))

	var verifyEvent models.Event
	if err := db.DB.First(&verifyEvent, eventID).Error; err == nil {
		logger.Info(fmt.Sprintf("Verification: Event %d in DB has status: %s", eventID, verifyEvent.Status))
	}

	return &event, nil
}

func DeleteEvent(eventID uint, userID uint) error {
	var event models.Event
	if err := db.DB.Where("id = ? AND owner_id = ?", eventID, userID).First(&event).Error; err != nil {
		logger.Error("Event not found or not owned by user: " + err.Error())
		return errors.New("event not found")
	}

	if err := db.DB.Delete(&event).Error; err != nil {
		logger.Error("Failed to delete event: " + err.Error())
		return err
	}

	logger.Info("Event deleted with ID: " + string(rune(eventID)))
	return nil
}

func GetSwappableSlots(userID uint) ([]models.Event, error) {
	var events []models.Event

	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}
	if err := db.DB.Preload("Owner").Where("owner_id != ? AND status = ?", userID, models.EventStatusSwappable).Find(&events).Error; err != nil {
		logger.Error("Failed to fetch swappable slots: " + err.Error())
		return nil, err
	}

	var filteredEvents []models.Event
	for _, event := range events {
		var count int64
		if err := db.DB.Model(&models.SwapRequest{}).Where("status = ? AND (requester_event_id = ? OR responder_event_id = ?)", models.PENDING, event.ID, event.ID).Count(&count).Error; err != nil {
			logger.Error("Failed to check swap requests for event: " + err.Error())
			continue
		}
		if count == 0 {
			filteredEvents = append(filteredEvents, event)
		}
	}

	logger.Info(fmt.Sprintf("Found %d swappable slots for user %d (excluding own events and events with pending swaps)", len(filteredEvents), userID))
	return filteredEvents, nil
}

func GetEventByID(eventID uint) (*models.Event, error) {
	var event models.Event
	if err := db.DB.First(&event, eventID).Error; err != nil {
		logger.Error("Event not found: " + err.Error())
		return nil, errors.New("event not found")
	}

	return &event, nil
}
