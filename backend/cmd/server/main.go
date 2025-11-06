package main

import (
	"github.com/amarjeet-choudhary666/slotSwapper/internals/config"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/db"
	"github.com/amarjeet-choudhary666/slotSwapper/internals/routes"
	"github.com/amarjeet-choudhary666/slotSwapper/pkg/utils/logger"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	logger.InitLogger()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "https://slot-swapper-peer-to-peer.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	cfg := config.LoadConfig()
	port := cfg.PORT

	_, err := db.ConnectDB(cfg)
	if err != nil {
		logger.Error("Failed to connect to database: " + err.Error())
		panic(err)
	}

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	routes.SetUpRoutes(r, cfg)

	r.Run(":" + port)
}
