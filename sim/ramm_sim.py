
import math, uuid, hashlib, matplotlib.pyplot as plt
from datetime import datetime
import time, random
from prettytable import PrettyTable
import io

class Wallet:
    wallets = {}
    def __init__(self,name):
        self.name = name
        self.address = hashlib.sha3_256(str(uuid.uuid4()).encode('utf-8')).hexdigest()
        self.pvt_balance = 0
        self.usdc_balance = 100000000
        self.transactions = []
        Wallet.wallets[name] = self

    def get_random_wallet():
        random_key = random.choice(list(Wallet.wallets.keys()))
        return Wallet.wallets[random_key]
    
class WalletTransactions:
    def __init__(self,tx_seq_id,action,pool_name,price,pvt_balance,usdc_balance):
        self.action = action
        self.pool_name = pool_name
        self.tx_seq_id = tx_seq_id
        self.price = price
        self.pvt_balance = pvt_balance
        self.usdc_balance = usdc_balance

class RAMM:
    STEEPNESS_FLATISH       = 10000000
    STEEPNES_MODERATE       = 1000000
    STEEPNESS_MEDIUM        = 100000 
    STEEPNESS_HIGH          = 10000
    STEEPNESS_AGGRESSIVE    = 1000
    steepness_lookup = {}
    steepness_lookup[10000000] = 'Flatish'
    steepness_lookup[1000000] = 'Moderate'
    steepness_lookup[100000] = 'Medium'
    steepness_lookup[10000] = 'High'
    steepness_lookup[1000] = 'Aggressive'
    
    
    def lookup_steepness(val):
        return RAMM.steepness_lookup[val]
    
    POOL_SEQ_ID = 1
    def __init__(self):
        self.pools = {}

    def create_pool(self,
        owner:Wallet,                    
        pvt_qty_max_primary,
        pvt_price_max_primary,
        pvt_price_initial_primary,
        pvt_available_secondary,
        steepness=STEEPNESS_MEDIUM,
        pool_name=f'Pool-{time.time()}',
        ):

        pool = Pool(
            pool_name=pool_name,
            pool_seq_id=RAMM.POOL_SEQ_ID,
            pvt_qty_max_primary=pvt_qty_max_primary,
            pvt_qty_max_secondary=pvt_qty_max_primary,
            pvt_price_max_primary=pvt_price_max_primary,
            pvt_price_max_secondary= (2 * pvt_price_max_primary) - pvt_price_initial_primary,
            pvt_price_initial_primary=pvt_price_initial_primary,
            pvt_available_secondary=pvt_available_secondary,
            steepness=steepness,
            owner=owner)
        RAMM.POOL_SEQ_ID += 1
        self.pools[pool.pool_id] = pool
        return pool
    
    def list_active_pools(self):
        return reversed( [p for p in self.pools.values() if not p.archived])

    def list_archived_pools(self):
        return reversed( [p for p in self.pools.values() if p.archived])
    
    def generate_price_curve_buffer(self,pool_id):
        return self.pools[pool_id].generate_price_curve_buffer()
    
    def generate_price_curve_xy(self,pool_id):
        return self.pools[pool_id].generate_price_curve_xy()
    
    def generate_treasury_curve_xy(self,pool_id):
        return self.pools[pool_id].generate_treasury_curve_xy()
    
    
    def generate_treasury_curve_buffer(self,pool_id):
        return self.pools[pool_id].generate_treasury_curve_buffer()
    
    def get_pool_transactions(self,pool_id):
        return self.pools[pool_id].transactions # see if we can type this

    def simulate_buys(self,pool_id,qty):
        pool = self.pools[pool_id]
        for n in range(qty):
            pool.buy()

    def archive_pool(self,pool_id):
        if pool_id in self.pools:
            self.pools[pool_id].archived = True

    def simulate_sells(self,pool_id,qty):
        pool = self.pools[pool_id]
        for n in range(qty):
            pool.sell()   

    def simulate_alternating(self,pool_id,qty):
        pool = self.pools[pool_id]
        for n in range(qty):
            pool.buy()
            pool.sell()

    

    def generate_bonding_curve_xy(self,pool_id):
        pool:Pool
        pool = self.pools[pool_id]
        return pool.generate_bonding_curve_xy()
    
    def generate_bonding_curve_buffer(self,pool_id):
        pool:Pool
        pool = self.pools[pool_id]
        return pool.generate_bonding_curve_buffer()

    def simulate(self,pool_id,buys,sells,buysells):
        self.simulate_buys(pool_id,buys)
        self.simulate_sells(pool_id,sells)
        self.simulate_alternating(pool_id,buysells)

    def expand(self,pool_id,amount):
        pool:Pool
        pool = self.pools[pool_id]
        pool.expand(amount)

class PVTToken:
    def __init__(self,owner):
        self.owner:Wallet = owner


class Pool:

    def __init__(self,
                 pool_name,
                 pool_seq_id,
                 pvt_qty_max_primary,
                 pvt_qty_max_secondary,
                 pvt_price_max_primary,
                 pvt_price_max_secondary,
                 pvt_price_initial_primary,
                 pvt_available_secondary,
                 steepness,
                 owner:Wallet):
        
        self.pvts = [PVTToken(owner=owner) for n in range(0,(pvt_qty_max_primary + pvt_qty_max_secondary))]
        
        self.pool_id = hashlib.sha3_256(str(uuid.uuid4()).encode('utf-8')).hexdigest()
        self.pool_name = pool_name
        self.pool_seq_id = pool_seq_id

        self.x = 0

        self.archived = False
        self.owner = owner

        self.treasury = 0

        self.tx_seq_id = 1
        self.in_secondary_mode = False
        


        self.pvt_qty_max_primary = pvt_qty_max_primary
        self.pvt_qty_max_secondary = pvt_qty_max_secondary
        self.pvt_available_secondary = pvt_available_secondary

        self.pvt_running_total_bought = 0
        self.pvt_running_total_sold = 0


        self.pvt_price_initial_primary = pvt_price_initial_primary

        self.pvt_price_max_primary = pvt_price_max_primary
        self.pvt_price_max_secondary = pvt_price_max_secondary

        self.a_primary_midpoint_initial_and_max = (pvt_price_max_primary - pvt_price_initial_primary) / 2
        self.b_primary_half_max_qty = pvt_qty_max_primary / 2
        self.c_primary_steepness = steepness

        self.a_secondary_midpoint_initial_and_max = (pvt_price_max_secondary - pvt_price_initial_primary) / 2
        self.b_secondary_half_max_qty = (pvt_qty_max_primary + pvt_qty_max_secondary) / 2
        self.c_secondary_steepness = steepness

        self.p_prime = self.pvt_price_initial_primary - self.get_unadjusted_price(1)
        self.p_doubleprime = self.get_price_primary(self.b_secondary_half_max_qty)-self.a_secondary_midpoint_initial_and_max
        
        self.soldout_hits = 0
        
        self.transactions = []


    def to_dict(self):
        return {
            "pool_id": self.pool_id,
            "pool_name": self.pool_name,
            "pool_seq_id": self.pool_seq_id,
            "pvt_qty_max_primary": self.pvt_qty_max_primary,
            "pvt_qty_max_secondary": self.pvt_qty_max_secondary,
            "pvt_price_max_primary": self.pvt_price_max_primary,
            "pvt_price_max_secondary": self.pvt_price_max_secondary,
            "pvt_price_initial_primary": self.pvt_price_initial_primary,
            "pvt_available_secondary": self.pvt_available_secondary,
            "c_primary_steepness": self.c_primary_steepness,
            "c_secondary_steepness": self.c_secondary_steepness,
            "treasury":self.treasury,
            "archived":self.archived
        }

    
    def get_unadjusted_price(self,x):
        return self.a_primary_midpoint_initial_and_max * ((x-self.b_primary_half_max_qty) / (math.sqrt(self.c_primary_steepness + (x-self.b_primary_half_max_qty)*(x-self.b_primary_half_max_qty)))+1)

    def get_price_primary(self,x):
        return self.a_primary_midpoint_initial_and_max * ((x-self.b_primary_half_max_qty) / (math.sqrt(self.c_primary_steepness + (x-self.b_primary_half_max_qty)*(x-self.b_primary_half_max_qty)))+1) + self.p_prime

    def get_treasury_min(self):
        return min([t.treasury for t in self.transactions],default=0)

    def get_treasury_max(self):
        return max([t.treasury for t in self.transactions],default=0)    
    
    def get_price_secondary(self,x):
        return self.a_secondary_midpoint_initial_and_max * ((x-self.b_secondary_half_max_qty) / (math.sqrt(self.c_secondary_steepness + (x-self.b_secondary_half_max_qty)*(x-self.b_secondary_half_max_qty)))+1) + self.p_doubleprime

    
    def generate_price_curve_xy(self):   
        x_up_to_capacity = list(range(0,int(self.pvt_qty_max_primary + self.pvt_available_secondary)))
        
        x_actual = list(range(0,int(self.pvt_qty_max_primary + self.pvt_qty_max_secondary)))
        y_actual = [self.get_price_secondary(xi) for xi in x_actual]
        
        
        y_primary = [self.get_price_primary(xi) for xi in x_up_to_capacity]
        y_secondary = [self.get_price_secondary(xi) for xi in x_up_to_capacity]
        x_switch = []
        y_switch = []
        for p in range(int(min([min(y_primary),min(y_secondary)])),int(max([max(y_primary),max(y_secondary)])+1)):
            x_switch.append(self.pvt_qty_max_primary)
            y_switch.append(p)

        return x_up_to_capacity, x_actual, y_actual, y_primary, y_secondary, x_switch, y_switch

    
    def generate_price_curve_buffer(self):
        x_up_to_capacity, x_actual, y_actual, y_primary, y_secondary, x_switch, y_switch =  self.generate_price_curve_xy()
        plt.plot(x_up_to_capacity, y_primary, label='Primary Mode',  color='red')
        plt.plot(x_up_to_capacity, y_secondary, label='Secondary Mode (Capacity)', color='green')
        plt.plot(x_actual, y_actual, label='Secondary Mode (Actual)', color='blue')
        plt.plot(x_switch, y_switch, label='Switch', color='black')
        plt.xlabel('X')
        plt.ylabel('Price')
        plt.legend()
        plt.title(f'Price Curve for {self.pool_name}')
        buf = io.BytesIO()
        plt.savefig(buf,format='png')
        buf.seek(0)
        plt.close()
        return buf
    
    def generate_treasury_curve_xy(self):
        x = list(range(0,len(self.transactions)))
        y = [tx.treasury for tx in self.transactions]
        return x, y

    def generate_treasury_curve_buffer(self):
        x, y = self.generate_treasury_curve_xy()
        #y_secondary = [self.get_price_secondary(xi) for xi in x]
        plt.plot(x, y, label='Accumulated Revenues',  color='red')
        plt.xlabel('Transactions')
        plt.ylabel('Revenues')
        plt.legend()
        plt.title(f'Treasury Curve for {self.pool_name}')
        buf = io.BytesIO()
        plt.savefig(buf,format='png')
        buf.seek(0)
        plt.close()
        return buf    

    def generate_curve(self):
        x = range(0,int(self.pvt_qty_max_primary + self.pvt_available_secondary))
        y_primary = [self.get_price_primary(xi) for xi in x]
        y_secondary = [self.get_price_secondary(xi) for xi in x]
        plt.plot(x, y_primary, label='Primary Mode',  color='red')
        plt.plot(x, y_secondary, label='Secondary Mode', color='blue')
        plt.xlabel('Token Supply')
        plt.ylabel('Price')
        plt.legend()
        plt.title(f'Bonding Curve for {self.pool_name}')
        plt.show()

    def generate_bonding_curve_xy(self):
        x_primary = []
        x_secondary = []
        y_primary = []
        y_secondary = []

        x_switch = []
        y_switch = []
        
        for x in range(1,self.pvt_qty_max_primary+1):
            price = self.get_price_primary(x)
            x_primary.append(x)
            y_primary.append(price)
        for x in range(1,int(self.pvt_qty_max_primary + self.pvt_qty_max_secondary)):
            price = self.get_price_secondary(x)
            x_secondary.append(x)
            y_secondary.append(price)
        for p in range(int(min([min(y_primary),min(y_secondary)])),int(max([max(y_primary),max(y_secondary)])+1)):
            x_switch.append(self.pvt_qty_max_primary)
            y_switch.append(p)
        
        return x_primary, x_secondary, y_primary, y_secondary, x_switch, y_switch

    def generate_bonding_curve_buffer(self):
        in_sec_mode = False
        x_primary, x_secondary, y_primary, y_secondary, x_switch, y_switch = self.generate_bonding_curve_xy()

        plt.plot(x_primary, y_primary, label='Primary Mode',  color='red')
        plt.plot(x_secondary, y_secondary, label='Secondary Mode', color='blue')
        plt.plot(x_switch, y_switch, label='Switch', color='black')
        plt.xlabel('X')
        plt.ylabel('P')
        plt.legend()
        plt.title(f'Bonding Curve for {self.pool_name}')
        buf = io.BytesIO()
        plt.savefig(buf,format='png')
        buf.seek(0)
        plt.close()
        return buf   
    

    
    def expand(self,amount):
        if (self.pvt_qty_max_secondary+amount)<=self.pvt_available_secondary:
            self.pvt_qty_max_secondary += amount
    
    def buy(self):
        if not self.in_secondary_mode:
            if self.x > (self.pvt_qty_max_primary + self.pvt_qty_max_secondary):
                self.soldout_hits += 1
                return # soldout
            price = self.get_price_primary(self.x+1)
        else:
            price = self.get_price_secondary(self.x+1)

        self.treasury += price
        self.pvt_running_total_bought += 1

        self.x += 1
        if not self.in_secondary_mode: self.check_switch()
        counterparty: Wallet = Wallet.get_random_wallet()
        while counterparty.usdc_balance < price:
            counterparty: Wallet = Wallet.get_random_wallet()
        
        counterparty.pvt_balance += 1
        counterparty.usdc_balance -= price
        tx = self.capture_snapshot('B',price,counterparty)
        self.transactions.append(tx)
        counterparty.transactions.append(WalletTransactions(action='B',pool_name=self.pool_name,tx_seq_id=tx.tx_seq_id,price=price,pvt_balance=counterparty.pvt_balance,usdc_balance=counterparty.usdc_balance))
        self.tx_seq_id += 1

    def get_transaction_count(self):
        return (len(self.transactions))
        
    
    def check_switch(self):
        if self.x == self.pvt_qty_max_primary:
            self.in_secondary_mode = True
    
    def sell(self):
        if self.in_secondary_mode:
            price = self.get_price_secondary(self.x-1)
            #self.pvt_qty_total_afs += 1
            self.pvt_running_total_sold += 1
            self.x -= 1
            self.treasury -= price
            counterparty: Wallet = Wallet.get_random_wallet()
            while counterparty.pvt_balance <= 0:
                counterparty: Wallet = Wallet.get_random_wallet()
            counterparty.pvt_balance -= 1
            counterparty.usdc_balance += price
            tx = self.capture_snapshot('S',price,counterparty)
            self.transactions.append(tx)
            counterparty.transactions.append(WalletTransactions(action='S',pool_name=self.pool_name,tx_seq_id=tx.tx_seq_id,price=price,pvt_balance=counterparty.pvt_balance,usdc_balance=counterparty.usdc_balance))
            self.tx_seq_id += 1

    def capture_snapshot(self,action,price,counterparty):
        tx = Transaction(self.tx_seq_id,
                         counterparty,
                         action,
                         self.x,
                         price,
                         #self.pvt_qty_total_afs,
                         self.pvt_running_total_bought,
                         self.pvt_running_total_sold,self.in_secondary_mode,self.treasury,self.p_prime,self.p_doubleprime,self.get_unadjusted_price(self.x),self.get_price_primary(self.x),self.get_price_secondary(self.x))
        return tx
    
    def generate_tx_pretty_table(self):
        txs = PrettyTable()
        txs.field_names = ["Seq ID","Timestamp","Action","x","Price","Total AFS","RT Bot","RT Sold","Secondary Mode","Treasury","P'","P''","P Un","Price if Primary","Price if Secondary"]
        tx: Transaction
        for tx  in self.transactions:
            txs.add_row([tx.tx_seq_id,tx.timestamp,tx.action,tx.x,tx.price,tx.total_afs,tx.rt_bought,tx.rt_sold,tx.is_secondary_mode,tx.treasury,tx.p_prime,tx.p_doubleprime,tx.p_un,tx.price_if_primary,tx.price_if_secondary])
        return txs

    def show_transactions(self):
        print(self.generate_tx_pretty_table())
    
    def save_tx_to_file(self):
        txs = self.generate_tx_pretty_table()
        with open(f'transactions-{time.time()}.csv', 'w', newline='') as f_output:
            f_output.write(txs.get_csv_string())



class Transaction:
 #   def __init__(self,tx_seq_id,counterparty,action,x,price,total_afs,rt_bought,rt_sold,is_secondary_mode,treasury,p_prime,p_doubleprime,p_un,price_if_primary,price_if_secondary):
    def __init__(self,tx_seq_id,counterparty,action,x,price,rt_bought,rt_sold,is_secondary_mode,treasury,p_prime,p_doubleprime,p_un,price_if_primary,price_if_secondary):
        self.tx_seq_id = tx_seq_id
        self.timestamp = time.time()
        self.action = action
        self.price = price
        self.x = x
        # self.total_afs = total_afs
        self.rt_bought = rt_bought
        self.rt_sold = rt_sold
        self.is_secondary_mode = is_secondary_mode
        self.treasury = treasury
        self.p_prime = p_prime
        self.p_doubleprime = p_doubleprime
        self.p_un = p_un
        self.price_if_primary = price_if_primary
        self.price_if_secondary = price_if_secondary
        self.counterparty:Wallet = counterparty
    def to_dict(self):
        return {
            "tx_seq_id": self.tx_seq_id,
            "timestamp": self.timestamp,
            "action": self.action,
            "price": self.price,
            "x": self.x,
            # "total_afs": self.total_afs,  # Uncomment if needed
            "rt_bought": self.rt_bought,
            "rt_sold": self.rt_sold,
            "is_secondary_mode": self.is_secondary_mode,
            "treasury": self.treasury,
            "p_prime": self.p_prime,
            "p_doubleprime": self.p_doubleprime,
            "p_un": self.p_un,
            "price_if_primary": self.price_if_primary,
            "price_if_secondary": self.price_if_secondary#,
            #"counterparty": self.counterparty.to_dict() if hasattr(self.counterparty, 'to_dict') else {},  # Convert counterparty to dict if possible
        }





