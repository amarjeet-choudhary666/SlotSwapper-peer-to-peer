package routes

import (
	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/gin-gonic/gin"
)

func SetUpRoutes(r *gin.Engine, cfg *config.Config) {
	UserRoutes(r, cfg)
	EventRoutes(r, cfg)
	SwapRoutes(r, cfg)
}
