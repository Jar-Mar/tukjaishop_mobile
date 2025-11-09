import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ssl_certfile="certs/localhost.pem",
        ssl_keyfile="certs/localhost-key.pem",
    )