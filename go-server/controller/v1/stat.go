package v1

import (
	"fmt"
	"net/http"
)

func Stat(w http.ResponseWriter, r *http.Request) {
	fmt.Println("[GET] /v1/stat")

	fmt.Fprintf(w, "200 OK")
}