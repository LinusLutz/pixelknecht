package main

import (
	"embed"
  "github.com/gin-gonic/gin"
	"github.com/rubenhoenle/pixelknecht/commanderer/config"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
)

//go:embed static/*
var static embed.FS

type floodMode struct {
	Enabled bool `json:"enabled"`
	// x and y offset
	PosY int `json:"posY"`
	PosX int `json:"posX"`
	// the url of the image to paint
	ImageUrl string `json:"imageUrl"`
}

func uploadFile(c *gin.Context) {
	// single file
	file, _ := c.FormFile("file")
	// Upload the file to specific dst.
	c.SaveUploadedFile(file, "temp-files/upload-"+strconv.FormatInt(time.Now().Unix(), 10)+".png")

}
func listFiles(c *gin.Context) {
	files, _ := ioutil.ReadDir("./temp-files/")
	fileList := []string{}
	for _, f := range files {
		fileList = append(fileList, f.Name())
	}
	c.JSON(http.StatusOK, gin.H{"files": fileList})
}
func setupRouter() *gin.Engine {
	router := gin.Default()
	router.GET("/mode", getMode)
	router.StaticFS("/pictures", http.Dir("./temp-files"))

	router.MaxMultipartMemory = 10 << 20 // 8 MiB
	router.POST("/upload", uploadFile)
	router.GET("/listFiles", listFiles)
	router.PUT("/mode", updateMode)
	router.GET("/api/server", getPixelflutServer)
	router.PUT("/api/server", updatePixelflutServer)

	trustedProxy := config.GetTrustedProxy()
	if trustedProxy != "" {
		router.SetTrustedProxies([]string{trustedProxy})
	} else {
		router.SetTrustedProxies(nil)
	}

	router.StaticFS("/static", http.FS(static))
	router.GET("/", func(c *gin.Context) {
		data, err := static.ReadFile("static/index.html")
		if err != nil {
			c.String(http.StatusInternalServerError, "Error reading index.html: %s", err)
			return
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", data)
	})

	return router
}

var mode floodMode

func main() {
	mode = floodMode{Enabled: true, PosY: 0, PosX: 0, ImageUrl: "https://s3.sfz-aalen.space/static/hackwerk/open.png"}
	router := setupRouter()
	router.Run(config.ReadEnvWithFallback("COMMANDERER_LISTEN_HOST", "localhost") + ":9000")
}

func getMode(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, mode)
}

func updateMode(c *gin.Context) {
	var updatedMode floodMode
	if err := c.BindJSON(&updatedMode); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	mode.Enabled = updatedMode.Enabled
	mode.PosY = updatedMode.PosY
	mode.PosX = updatedMode.PosX
	mode.ImageUrl = updatedMode.ImageUrl
	c.IndentedJSON(http.StatusOK, mode)
}
