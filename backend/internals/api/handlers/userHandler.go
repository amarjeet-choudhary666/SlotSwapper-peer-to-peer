package handlers

import (
	"net/http"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/services"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/models"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
	pkg "github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/security"
	"github.com/gin-gonic/gin"
)

func RegisterUserHandler(c *gin.Context) {
	var input models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   err,
			"message": "failed to bind json",
		})
		return
	}

	if input.Name == "" || input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "All fields are required",
		})
		return
	}

	hashPassword, err := pkg.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"message": "failed to hash password",
		})
		return
	}

	input.Password = hashPassword

	user, err := services.CreateUser(&input)
	if err != nil {
		logger.Error("Failed to create user: " + err.Error() + " for email: " + input.Email)
		if err.Error() == "email already exists" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   err,
				"message": "user already exists with this email",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"message": "failed to create user",
		})
		return
	}

	logger.Info("User created successfully for email: " + user.Email)
	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    user,
		"message": "user created successfully",
	})

}

func SignInUserHandler(c *gin.Context, cfg *config.Config) {
	var input models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   err,
			"message": "failed to bind json",
		})
		return
	}

	if input.Email == "" || input.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "email and password are required",
		})
		return
	}

	user, err := services.GetUserByEmail(input.Email)
	if err != nil {
		logger.Error("User sign in failed: user not found for email: " + input.Email)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   err,
			"message": "invalid credentials",
		})
		return
	}

	if !pkg.ComparePassword(user.Password, input.Password) {
		logger.Error("User sign in failed: invalid password for email: " + input.Email)
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "invalid credentials",
		})
		return
	}

	accessToken, err := pkg.GenerateAccessToken(user.ID, user.Email, cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"message": "failed to generate access token",
		})
		return
	}

	refreshToken, err := pkg.GenerateRefreshToken(user.ID, user.Email, cfg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"message": "failed to generate refresh token",
		})
		return
	}

	user.RefreshToken = refreshToken
	err = services.UpdateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   err,
			"message": "failed to update user",
		})
		return
	}

	logger.Info("User signed in successfully for email: " + user.Email)
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"user":          user,
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"message":       "sign in successful",
	})
}

func GetUserProfileHandler(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Error("User ID not found in context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User not authenticated"})
		return
	}

	user, err := services.GetEmailByID(userID.(uint))
	if err != nil {
		logger.Error("Failed to fetch user profile: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user profile"})
		return
	}

	logger.Info("User profile accessed for email: " + user.Email)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user":    user,
		"message": "Profile retrieved successfully",
	})
}
