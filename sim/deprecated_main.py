from typing import Union
from fastapi import FastAPI, Request
from deprecated_ramm_sim import *
from pydantic import BaseModel
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates

app = FastAPI()
ramm = RAMM()
templates = Jinja2Templates(directory="templates")

class PoolData(BaseModel):
    poolName: str
    initialQuantity: int
    secondaryModeQuantity: int
    initialPrice: float
    maxPrice: float
    c: int

#(self,id,initial_qty,mode_qty,initial_price,max_price,c):
    
@app.post("/api/create_pool")
async def create_pool(pool_data: PoolData):
    # Access the validated data in pool_data
    # You can perform further processing and database operations here
    # id,qty,mode_qty,p0,pmax,c
    ramm.create_pool(
        id=pool_data.poolName,
        qty=pool_data.initialQuantity,
        mode_qty=pool_data.secondaryModeQuantity,
        p0=pool_data.initialPrice,
        pmax=pool_data.maxPrice,
        c=pool_data.c
    )
    return {"message": "Pool created successfully"}

@app.post("/api/pools")
async def get_pools_list():
    pools = []
    for k,v in ramm.pools.items():
        pools.append(
            PoolData(
            poolName=k,
            initialQuantity=v.initial_qty,
            secondaryModeQuantity=v.mode_qty,
            initialPrice=v.initial_price,
            maxPrice=v.max_price,
            c=v.c
            )
        )
    return JSONResponse(content=pools)
        
@app.get("/pool_list", response_class=HTMLResponse)
async def pool_list(request: Request):
    pools = []
    for k,v in ramm.pools.items():
        pools.append(
            PoolData(
            poolName=k,
            initialQuantity=v.initial_qty,
            secondaryModeQuantity=v.mode_qty,
            initialPrice=v.initial_price,
            maxPrice=v.max_price,
            c=v.c
            )
        )
    return templates.TemplateResponse("pool_list.html", {"request": request, "pool_data": pools})
    



@app.get("/")
async def create_pool():
    # Assuming the HTML file is in the same directory as this Python script
    html_file_path = Path(__file__).parent / "create_pool.html"
    
    # Serve the HTML file as a response
    return FileResponse(html_file_path)