package services

import (
	"errors"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/db"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/models"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
)

func CreateSwapRequest(requesterID uint, requesterEventID uint, responderEventID uint) (*models.SwapRequest, error) {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}
	requesterEvent, err := GetEventByID(requesterEventID)
	if err != nil {
		return nil, errors.New("requester event not found")
	}

	responderEvent, err := GetEventByID(responderEventID)
	if err != nil {
		return nil, errors.New("responder event not found")
	}

	if requesterEvent.OwnerID != requesterID {
		return nil, errors.New("requester does not own the event")
	}

	if responderEvent.Status != models.EventStatusSwappable {
		return nil, errors.New("responder event is not swappable")
	}

	if requesterEvent.Status != models.EventStatusSwappable {
		return nil, errors.New("requester event is not swappable")
	}

	swapRequest := models.SwapRequest{
		RequesterID:      requesterID,
		ResponderID:      responderEvent.OwnerID,
		RequesterEventID: requesterEventID,
		ResponderEventID: responderEventID,
		Status:           models.PENDING,
	}

	if err := db.DB.Create(&swapRequest).Error; err != nil {
		logger.Error("Failed to create swap request: " + err.Error())
		return nil, err
	}

	requesterEvent.Status = models.EventStatusSwapPending
	responderEvent.Status = models.EventStatusSwapPending

	if err := db.DB.Save(requesterEvent).Error; err != nil {
		logger.Error("Failed to update requester event status: " + err.Error())
		return nil, err
	}

	if err := db.DB.Save(responderEvent).Error; err != nil {
		logger.Error("Failed to update responder event status: " + err.Error())
		return nil, err
	}

	logger.Info("Swap request created successfully")
	return &swapRequest, nil
}

func GetIncomingSwapRequests(userID uint) ([]models.SwapRequest, error) {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}
	var requests []models.SwapRequest
	if err := db.DB.Preload("Requester").Preload("RequesterEvent").Preload("ResponderEvent").
		Where("responder_id = ?", userID).Find(&requests).Error; err != nil {
		logger.Error("Failed to fetch incoming swap requests: " + err.Error())
		return nil, err
	}

	return requests, nil
}

func GetOutgoingSwapRequests(userID uint) ([]models.SwapRequest, error) {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return nil, errors.New("database connection is nil")
	}
	var requests []models.SwapRequest
	if err := db.DB.Preload("Responder").Preload("RequesterEvent").Preload("ResponderEvent").
		Where("requester_id = ?", userID).Find(&requests).Error; err != nil {
		logger.Error("Failed to fetch outgoing swap requests: " + err.Error())
		return nil, err
	}

	return requests, nil
}

func RespondToSwapRequest(requestID uint, userID uint, accepted bool) error {
	if db.DB == nil {
		logger.Error("Database connection is nil")
		return errors.New("database connection is nil")
	}
	var request models.SwapRequest
	if err := db.DB.Preload("RequesterEvent").Preload("ResponderEvent").First(&request, requestID).Error; err != nil {
		logger.Error("Swap request not found: " + err.Error())
		return errors.New("swap request not found")
	}

	if request.ResponderID != userID {
		return errors.New("unauthorized to respond to this request")
	}

	if accepted {
		request.Status = models.ACCEPTED

		tempOwnerID := request.RequesterEvent.OwnerID
		request.RequesterEvent.OwnerID = request.ResponderEvent.OwnerID
		request.ResponderEvent.OwnerID = tempOwnerID

		request.RequesterEvent.Status = models.EventStatusBusy
		request.ResponderEvent.Status = models.EventStatusBusy

		if err := db.DB.Save(&request.RequesterEvent).Error; err != nil {
			logger.Error("Failed to update requester event: " + err.Error())
			return err
		}

		if err := db.DB.Save(&request.ResponderEvent).Error; err != nil {
			logger.Error("Failed to update responder event: " + err.Error())
			return err
		}
	} else {
		request.Status = models.REJECTED
		request.RequesterEvent.Status = models.EventStatusSwappable
		request.ResponderEvent.Status = models.EventStatusSwappable

		if err := db.DB.Save(&request.RequesterEvent).Error; err != nil {
			logger.Error("Failed to update requester event: " + err.Error())
			return err
		}

		if err := db.DB.Save(&request.ResponderEvent).Error; err != nil {
			logger.Error("Failed to update responder event: " + err.Error())
			return err
		}
	}

	if err := db.DB.Save(&request).Error; err != nil {
		logger.Error("Failed to update swap request: " + err.Error())
		return err
	}

	logger.Info("Swap request responded to successfully")
	return nil
}
