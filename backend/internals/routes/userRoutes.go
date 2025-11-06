package routes

import (
	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/handlers"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/api/middlewares"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine, cfg *config.Config) {
	userGroup := r.Group("/api/users")
	{
		userGroup.POST("/signup", handlers.RegisterUserHandler)
		userGroup.POST("/signin", func(c *gin.Context) { handlers.SignInUserHandler(c, cfg) })
	}

	protected := r.Group("/api")
	protected.Use(middlewares.JWTAuthMiddleware(cfg))
	{
		protected.GET("/users/profile", handlers.GetUserProfileHandler)
	}
}
