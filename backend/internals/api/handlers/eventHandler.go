package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/services"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/models"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
	"github.com/gin-gonic/gin"
)

func CreateEventHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.Event
	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Error("Failed to bind JSON for event creation: " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.OwnerID = userID.(uint)

	event, err := services.CreateEvent(&input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Event created successfully")
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    event,
		"message": "Event created successfully",
	})
}

func GetUserEventsHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	events, err := services.GetUserEvents(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    events,
		"message": "Events retrieved successfully",
	})
}

func UpdateEventHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	eventIDStr := c.Param("id")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		logger.Error("Invalid event ID: " + eventIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var input models.UpdateEventInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Error("Failed to bind JSON for event update: " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Info(fmt.Sprintf("Received update request for event %s with input: %+v", eventIDStr, input))

	event, err := services.UpdateEventPartial(uint(eventID), userID.(uint), &input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Event updated successfully")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    event,
		"message": "Event updated successfully",
	})
}

func DeleteEventHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	eventIDStr := c.Param("id")
	eventID, err := strconv.ParseUint(eventIDStr, 10, 32)
	if err != nil {
		logger.Error("Invalid event ID: " + eventIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	err = services.DeleteEvent(uint(eventID), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Event deleted successfully")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Event deleted successfully",
	})
}

func GetSwappableSlotsHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	slots, err := services.GetSwappableSlots(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    slots,
		"message": "Swappable slots retrieved successfully",
	})
}
