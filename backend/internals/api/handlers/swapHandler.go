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

type SwapResponseInput struct {
	Accepted bool `json:"accepted" binding:"required"`
}

func CreateSwapRequestHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.SwapRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Error("Failed to bind JSON for swap request: " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	request, err := services.CreateSwapRequest(userID.(uint), input.MySlotID, input.TheirSlotID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Info(fmt.Sprintf("Swap request created successfully with ID: %d", request.ID))
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    request,
		"message": "Swap request created successfully",
	})
}

func GetIncomingSwapRequestsHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	requests, err := services.GetIncomingSwapRequests(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    requests,
		"message": "Incoming swap requests retrieved successfully",
	})
}

func GetOutgoingSwapRequestsHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	requests, err := services.GetOutgoingSwapRequests(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    requests,
		"message": "Outgoing swap requests retrieved successfully",
	})
}

func RespondToSwapRequestHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	requestIDStr := c.Param("requestId")
	requestID, err := strconv.ParseUint(requestIDStr, 10, 32)
	if err != nil {
		logger.Error("Invalid request ID: " + requestIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request ID"})
		return
	}

	var input SwapResponseInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logger.Error("Failed to bind JSON for swap response: " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = services.RespondToSwapRequest(uint(requestID), userID.(uint), input.Accepted)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := "rejected"
	if input.Accepted {
		status = "accepted"
	}

	logger.Info("Swap request " + status + " successfully")
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Swap request " + status + " successfully",
	})
}
