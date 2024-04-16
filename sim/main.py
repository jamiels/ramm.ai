from typing import Union
from fastapi import FastAPI, Request, Form
from ramm_sim import *
from pydantic import BaseModel, Field
from fastapi.responses import FileResponse, RedirectResponse
from pathlib import Path
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from typing import Dict, Any
from fastapi.middleware.cors import CORSMiddleware

import logging
logging.basicConfig(filename='app.log', level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = FastAPI()
ramm = RAMM()
print('starting')
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


alan = Wallet('Alan')
gerard = Wallet('Gerard')
jamiel = Wallet('Jamiel')
andrew = Wallet('Andrew')
alice = Wallet('Alice')
bob = Wallet('Bob')
linda = Wallet('Linda')
joe = Wallet('Joe')

# pool = ramm.create_pool(pool_name='Nike#1',owner=alice)
# ramm.simulate_buys(pool.pool_id,3001)
# ramm.simulate_sells(pool.pool_id,500)
# ramm.simulate_alternating(pool.pool_id,100)
# ramm.simulate_sells(pool.pool_id,2500)

# pool = ramm.create_pool(pool_name='Nike#2',owner=bob,steepness=RAMM.STEEPNESS_AGGRESSIVE)
# ramm.simulate_buys(pool.pool_id,3001)
# ramm.simulate_sells(pool.pool_id,500)
# ramm.simulate_alternating(pool.pool_id,100)
# ramm.simulate_sells(pool.pool_id,2500)

# pool = ramm.create_pool(pool_name='Nike#3',owner=bob,steepness=RAMM.STEEPNESS_FLATISH)
# ramm.simulate_buys(pool.pool_id,3001)
# ramm.simulate_sells(pool.pool_id,500)
# ramm.simulate_alternating(pool.pool_id,100)
# ramm.simulate_sells(pool.pool_id,2500)


# pool = ramm.create_pool(pool_name='12K BuySell Pairs',owner=linda)
# ramm.simulate_buys(pool.pool_id,3001)
# ramm.simulate_alternating(pool.pool_id,12000)

# pool = ramm.create_pool(pool_name='Buy All Then Sell All',owner=linda)
# ramm.simulate_buys(pool.pool_id,6000)
# ramm.simulate_sells(pool.pool_id,6000)

# pool = ramm.create_pool(pool_name='Buy 3K+1',owner=linda)
# ramm.simulate_buys(pool.pool_id,3001)

pool = ramm.create_pool(pool_name='NegPrice#1',
                        pvt_qty_max_primary=1000,
                        pvt_price_max_primary=10,
                        pvt_available_secondary=2000,
                        pvt_price_initial_primary=1,
                        steepness=RAMM.STEEPNESS_MEDIUM,
                        owner=joe)
ramm.simulate_buys(pool.pool_id,3100)

pool = ramm.create_pool(pool_name='NegPrice#2',
                        pvt_qty_max_primary=1000,
                        pvt_price_max_primary=10,
                        pvt_available_secondary=2000,
                        pvt_price_initial_primary=1,
                        steepness=RAMM.STEEPNESS_AGGRESSIVE,
                        owner=joe)
ramm.simulate_buys(pool.pool_id,3100)

pool = ramm.create_pool(pool_name='Gibson Qty Unequal#1',
                        pvt_qty_max_primary=1000,
                        pvt_available_secondary=2000,
                        pvt_price_max_primary=5000,
                        pvt_price_initial_primary=3000,
                        steepness=RAMM.STEEPNESS_MEDIUM,
                        owner=joe)
ramm.simulate_buys(pool.pool_id,3100)

pool = ramm.create_pool(pool_name='Gibson Qty Unequal#2',
                        pvt_qty_max_primary=1000,
                        pvt_price_max_primary=5000,
                        pvt_available_secondary=2000,
                        pvt_price_initial_primary=3000,
                        steepness=RAMM.STEEPNESS_AGGRESSIVE,
                        owner=joe)
ramm.simulate_buys(pool.pool_id,3100)

class WalletModel(BaseModel):
    # Add wallet attributes here
    pass

class PVTTokenModel(BaseModel):
    # Assuming you have a PVTToken class, define its attributes here
    owner: WalletModel

class TransactionModel(BaseModel):
    tx_seq_id: int
    timestamp: float = Field(default_factory=time.time)
    action: str
    price: float
    x: int
    rt_bought: int
    rt_sold: int
    is_secondary_mode: bool
    treasury: float
    p_prime: float
    p_doubleprime: float
    p_un: float
    price_if_primary: float
    price_if_secondary: float
    # For the counterparty, use WalletModel if you want detailed representation, or use a simpler type as needed
    #counterparty: WalletModel

class PoolModel(BaseModel):
    pool_id: str
    pool_name: str
    pool_seq_id: int
    pvt_qty_max_primary: int
    pvt_qty_max_secondary: int
    pvt_price_max_primary: float
    pvt_price_max_secondary: float
    pvt_price_initial_primary: float    
    pvt_available_secondary: int
    c_primary_steepness: int
    c_secondary_steepness: int
    treasury: float
    archived: bool


    # owner: WalletModel
    # pvts: list[PVTTokenModel]

#pool.show_transactions()
#pool.save_tx_to_file()

@app.get("/api/v1/pools")
async def api_pools_list():
    return {k: PoolModel(**v.to_dict()) for k, v in ramm.pools.items()}


@app.get("/api/v1/pool/csv/{pool_id}")
async def get_pool_csv(pool_id:str):
    # Sample pool data (replace with actual data retrieval logic)
    pool = ramm.pools[pool_id]

    # Convert the Pool object to CSV
    csv_content = "tx_seq_id,timestamp,action,x,price,total_afs,rt_bought,rt_sold,is_secondary_mode,treasury,p_prime,p_doubleprime,p_un,price_if_primary,price_if_secondary\n"
    for transaction in pool.transactions:
        csv_content += f"{transaction.tx_seq_id},{transaction.timestamp},{transaction.action},{transaction.x},{transaction.price},{transaction.total_afs},{transaction.rt_bought},{transaction.rt_sold},{transaction.is_secondary_mode},{transaction.treasury},{transaction.p_prime},{transaction.p_doubleprime},{transaction.p_un},{transaction.price_if_primary},{transaction.price_if_secondary}\n"

    # Return the CSV c
    # Return the CSV content
    headers = {
        'Content-Disposition': 'attachment; filename="pool.csv"',
        'Content-Type': 'text/csv',
    }
    return Response(content=csv_content, media_type="text/csv", headers=headers)

@app.get("/api/v1/pool/tx/{pool_id}")
async def api_pool_transactions(request: Request, pool_id:str):
    #txs = ramm.get_pool_transactions(pool_id)
    return [TransactionModel(**v.to_dict()) for v in ramm.get_pool_transactions(pool_id)]

@app.get("/hello")
async def hello():
    return {'hello':'world'}

@app.post("/api/v1/create-pool",response_class=JSONResponse)
async def api_create_pool(request: Request):
    data = await request.json()
    print('data',data)
    owner=data['owner']
    ramm.create_pool(
        pool_name=data['pool_name'],
        owner=Wallet.wallets[owner],
        pvt_available_secondary=int(data['pvt_available_secondary']),
        pvt_qty_max_primary=int(data['pvt_qty_max_primary']),
        pvt_price_max_primary=float(data['pvt_price_max_primary']),
        pvt_price_initial_primary=float(data['pvt_price_initial_primary']),
        steepness=int(data['steepness']))
    return {"PoolCreated":True}
    

@app.get("/api/v1/price-curve/{pool_id}",response_class=JSONResponse)
async def api_pool_price_curve(pool_id:str):
    x_up_to_capacity, x_actual, y_actual, y_primary, y_secondary, x_switch, y_switch =  ramm.generate_price_curve_xy(pool_id)
    resp = {
        'Primary Mode':{'x':x_up_to_capacity,'y':y_primary},
        'Secondary Mode (Capacity)': {'x':x_up_to_capacity,'y':y_secondary},
        'Seconary Mode (Actual)': {'x':x_actual,'y':y_actual},
        'Switch': {'x':x_switch,'y':y_switch}
        }
    return resp


@app.get("/api/v1/treasury-curve/{pool_id}",response_class=JSONResponse)
async def api_pool_treasury_curve(pool_id:str):
    x,y=  ramm.generate_treasury_curve_xy(pool_id)
    resp = {
        'Revenues':{'x':x,'y':y}}
    return resp

@app.get("/api/v1/bonding-curve/{pool_id}",response_class=JSONResponse)
async def api_pool_bonding_curve(pool_id:str):
    x_primary, x_secondary, y_primary, y_secondary, x_switch, y_switch =  ramm.generate_bonding_curve_xy(pool_id)
    resp = {
        'Primary Mode':{'x':x_primary,'y':y_primary},
        'Secondary Mode': {'x':x_secondary,'y':y_secondary},
        'Switch': {'x':x_switch,'y':y_switch}
        }
    return resp

@app.get("/api/v1/expand/{pool_id}/{amount}", response_class=JSONResponse)
async def api_pool_expand(pool_id:str,amount:int):
    ramm.expand(pool_id,amount)
    resp = {'Expanded':amount}
    return resp

@app.get("/api/v1/simulate/{pool_id}/{buys}/{sells}/{buysells}", response_class=JSONResponse)
async def simulate_submit_form(
        pool_id: str,
        buys: int, 
        sells: int, 
        buysells: int):
    # Here you can process the form data
    # For example, you might create a new object or run some calculations

    # After processing, you might redirect to another page or return a response
    print(f'{pool_id} {buys} {sells} {buysells}')
    ramm.simulate(pool_id,buys,sells,buysells)
    resp = {'Simulated':True}
    return resp

@app.get("/diagnostic/{pool_id}", response_class=HTMLResponse)
async def pool_diagnostic(request: Request, pool_id:str):
    pool = ramm.pools[pool_id]
    return templates.TemplateResponse("pool_diagnostic.html", {"request": request, "pool": pool})

@app.get("/", response_class=HTMLResponse)
async def pools_list(request: Request):
    pools = ramm.list_active_pools()
    return templates.TemplateResponse("pools.html", {"request": request, "pools": pools, "RAMM":RAMM, "archived":"Active"})

@app.get("/archived", response_class=HTMLResponse)
async def archived_pools_list(request: Request):
    pools = ramm.list_archived_pools()
    return templates.TemplateResponse("pools.html", {"request": request, "pools": pools, "RAMM":RAMM, "archived":"Archived"})

@app.get("/tx/{pool_id}", response_class=HTMLResponse)
async def pool_transactions(request: Request, pool_id:str):
    txs = ramm.get_pool_transactions(pool_id)
    return templates.TemplateResponse("pool_transactions.html", {"request": request, "txs": txs})

@app.get("/expand/{pool_id}/{amount}", response_class=HTMLResponse)
async def pool_expand(request: Request, pool_id:str,amount:int):
    ramm.expand(pool_id,amount)
    return RedirectResponse(url='/', status_code=303)

@app.get("/wallet/tx/{wallet_id}", response_class=HTMLResponse)
async def pool_list(request: Request, wallet_id:str):
    txs = Wallet.wallets[wallet_id].transactions
    return templates.TemplateResponse("wallet_transactions.html", {"request": request, "txs": txs})

@app.get("/wallets", response_class=HTMLResponse)
async def wallets_list(request: Request):
    return templates.TemplateResponse("wallets.html", {"request": request, "wallets": Wallet.wallets})

@app.get("/curve/{pool_id}", response_class=Response)
async def pool_list(request: Request, pool_id:str):
    buf = ramm.generate_price_curve_buffer(pool_id)
    return Response(bytes(buf.read()), media_type='image/png')

@app.get("/bondcurve/{pool_id}", response_class=Response)
async def pool_list(request: Request, pool_id:str):
    buf = ramm.generate_bonding_curve_buffer(pool_id)
    return Response(bytes(buf.read()), media_type='image/png')

@app.get("/treasury/{pool_id}", response_class=Response)
async def pool_list(request: Request, pool_id:str):
    buf = ramm.generate_treasury_curve_buffer(pool_id)
    return Response(bytes(buf.read()), media_type='image/png')

@app.get("/simulate/{pool_id}", response_class=HTMLResponse)
async def simulate(request: Request, pool_id:str):
    html_content = f"""
<html>
    <head>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <form action="/simulate-submit-form/{pool_id}" method="post">
                <div class="form-group">
                    Buys <input type="number" class="form-control" name="buys" placeholder="Buys" value="0">
                </div>
                <div class="form-group">
                    Sells <input type="number" class="form-control" name="sells" placeholder="Sells" value="0">
                </div>
                <div class="form-group">
                    Buy/Sells <input type="number" class="form-control" name="buysells" placeholder="Buy/Sell Pairs" value="0">
                </div>                           
                <div class="form-group">
                    <input type="submit" class="btn btn-primary" value="Run Simulator">
                </div>
            </form>
        </div>
    </body>
</html>

    """
    return html_content


@app.get("/create-pool",response_class=HTMLResponse)
async def create_pool():
    html_content = """
<html>
    <head>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
        <div class="container mt-5">
            <form action="/create-pool-submit-form" method="post">
                <div class="form-group">
                    <input type="text" class="form-control" name="pool_name" placeholder="Pool Name">
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" name="pvt_qty_max_primary" placeholder="Max Primary Quantity">
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" name="pvt_price_max_primary" placeholder="Max Primary Price">
                </div>
                <div class="form-group">
                    <input type="number" class="form-control" name="pvt_available_secondary" placeholder="Secondary Available">
                </div>                
                <div class="form-group">
                    <input type="number" class="form-control" name="pvt_price_initial_primary" placeholder="Initial Primary Price">
                </div>
                <!-- Dropdown for Steepness -->
                <div class="form-group">
                    <label for="steepness">Steepness</label>
                    <select class="form-control" id="steepness" name="steepness">
                        <option value="10000000">STEEPNESS_FLATISH</option>
                        <option value="1000000">STEEPNESS_MODERATE</option>
                        <option value="100000">STEEPNESS_MEDIUM</option>
                        <option value="10000">STEEPNESS_HIGH</option>
                        <option value="1000">STEEPNESS_AGGRESSIVE</option>
                    </select>
                </div>           
                <div class="form-group">
                    <label for="owner">Owner</label>
                    <select class="form-control" id="owner" name="owner">
                        <option value="Alan">Alan</option>
                        <option value="Gerard">Gerard</option>
                        <option value="Andrew">Andrew</option>
                        <option value="Jamiel">Jamiel</option>                    
                        <option value="Alice">Alice</option>
                        <option value="Bob">Bob</option>
                        <option value="Linda">Linda</option>
                        <option value="Joe">Joe</option>
                    </select>
                </div>                                         
                <div class="form-group">
                    <input type="submit" class="btn btn-primary" value="Create Pool">
                </div>
            </form>
        </div>
    </body>
</html>

    """
    return html_content


@app.post("/create-pool-submit-form")
async def submit_form(
    pool_name: str = Form(...), 
    pvt_qty_max_primary: int = Form(...), 
    pvt_price_max_primary: float = Form(...), 
    pvt_available_secondary: int = Form(...),
    pvt_price_initial_primary: float = Form(...), 
    steepness: float = Form(...), 
    owner:str = Form(...)):
    ramm.create_pool(
        pool_name=pool_name,
        owner=Wallet.wallets[owner],
        pvt_available_secondary=pvt_available_secondary,
        pvt_qty_max_primary=pvt_qty_max_primary,
        pvt_price_max_primary=pvt_price_max_primary,
        pvt_price_initial_primary=pvt_price_initial_primary,
        steepness=steepness)
    return {"PoolCreated":True}


@app.get("/archive/{pool_id}")
async def archive_pool(pool_id: str):
    ramm.archive_pool(pool_id)
    return RedirectResponse(url='/', status_code=303)

@app.post("/simulate-submit-form/{pool_id}")
async def simulate_submit_form(
        pool_id: str,
        buys: int = Form(...), 
        sells: int = Form(...), 
        buysells: int = Form(...),

    ):
    # Here you can process the form data
    # For example, you might create a new object or run some calculations

    # After processing, you might redirect to another page or return a response
    print(f'{pool_id} {buys} {sells} {buysells}')
    ramm.simulate(pool_id,buys,sells,buysells)
    return RedirectResponse(url='/', status_code=303)


@app.get("/csv/{pool_id}")
async def get_pool_csv(pool_id:str):
    # Sample pool data (replace with actual data retrieval logic)
    pool = ramm.pools[pool_id]

    # Convert the Pool object to CSV
    csv_content = "tx_seq_id,timestamp,action,x,price,total_afs,rt_bought,rt_sold,is_secondary_mode,treasury,p_prime,p_doubleprime,p_un,price_if_primary,price_if_secondary\n"
    for transaction in pool.transactions:
        csv_content += f"{transaction.tx_seq_id},{transaction.timestamp},{transaction.action},{transaction.x},{transaction.price},{transaction.total_afs},{transaction.rt_bought},{transaction.rt_sold},{transaction.is_secondary_mode},{transaction.treasury},{transaction.p_prime},{transaction.p_doubleprime},{transaction.p_un},{transaction.price_if_primary},{transaction.price_if_secondary}\n"

    # Return the CSV c
    # Return the CSV content
    headers = {
        'Content-Disposition': 'attachment; filename="pool.csv"',
        'Content-Type': 'text/csv',
    }
    return Response(content=csv_content, media_type="text/csv", headers=headers)
