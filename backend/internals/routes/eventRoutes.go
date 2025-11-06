package routes

import (
	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/handlers"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/middlewares"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/gin-gonic/gin"
)

func EventRoutes(r *gin.Engine, cfg *config.Config) {
	protected := r.Group("/api")
	protected.Use(middlewares.JWTAuthMiddleware(cfg))
	{
		protected.POST("/events", handlers.CreateEventHandler)
		protected.GET("/events", handlers.GetUserEventsHandler)
		protected.PUT("/events/:id", handlers.UpdateEventHandler)
		protected.DELETE("/events/:id", handlers.DeleteEventHandler)
		protected.GET("/swappable-slots", handlers.GetSwappableSlotsHandler)
	}
}
