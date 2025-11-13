from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.member_routes import router as MemberRouter
from routes.goods_routes import router as GoodsRouter
from routes.order_routes import router as OrderRouter

app = FastAPI(title="Tookjai Backend", version="1.0.0", redirect_slashes=False)

# ✅ ตั้งค่า CORS ให้เชื่อมกับ React ได้
origins = [
    "http://localhost:5173",
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "https://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ รวม router ทั้งหมด
app.include_router(MemberRouter)
app.include_router(GoodsRouter)
app.include_router(OrderRouter)

@app.get("/")
def root():
    return {"message": "🚀 Tookjai Backend running!"}