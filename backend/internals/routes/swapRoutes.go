package routes

import (
	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/handlers"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/middlewares"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/gin-gonic/gin"
)

func SwapRoutes(r *gin.Engine, cfg *config.Config) {
	protected := r.Group("/api")
	protected.Use(middlewares.JWTAuthMiddleware(cfg))
	{
		protected.POST("/swap-request", handlers.CreateSwapRequestHandler)
		protected.GET("/swap-requests/incoming", handlers.GetIncomingSwapRequestsHandler)
		protected.GET("/swap-requests/outgoing", handlers.GetOutgoingSwapRequestsHandler)
		protected.POST("/swap-response/:requestId", handlers.RespondToSwapRequestHandler)
	}
}
