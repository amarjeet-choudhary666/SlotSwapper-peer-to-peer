package middlewares

import (
	"net/http"
	"strings"

	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
	pkg "github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/security"
	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			logger.Warn("Unauthorized access attempt: missing Authorization header")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			logger.Warn("Unauthorized access attempt: invalid token format")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		claims, err := pkg.ValidateAccessToken(tokenString, cfg)
		if err != nil {
			logger.Warn("Unauthorized access attempt: invalid token - " + err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set user claims in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)

		logger.Info("Authenticated user: " + claims.Email)
		c.Next()
	}
}