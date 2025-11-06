package logger

import (
	"log"
	"os"
)

var (
	InfoLogger  *log.Logger
	ErrorLogger *log.Logger
	DebugLogger *log.Logger
	WarnLogger  *log.Logger
)

func InitLogger() {
	InfoLogger = log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	ErrorLogger = log.New(os.Stderr, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
	DebugLogger = log.New(os.Stdout, "DEBUG: ", log.Ldate|log.Ltime|log.Lshortfile)
	WarnLogger = log.New(os.Stdout, "WARN: ", log.Ldate|log.Ltime|log.Lshortfile)
}

func Info(msg string) {
	InfoLogger.Println(msg)
}

func Error(msg string) {
	ErrorLogger.Println(msg)
}

func Debug(msg string) {
	DebugLogger.Println(msg)
}

func Warn(msg string) {
	WarnLogger.Println(msg)
}