# import math
# import matplotlib.pyplot as plt
# from prettytable import PrettyTable
# from datetime import datetime
# import time
# import uuid, hashlib
# import pandas as pd


# class Address:
#     def __init__(self,address):
#         self.address = address

# class Transaction:
#     def __init__(self,price,secondary_mode,token):
#         self.token = token
#         self.price = price
#         self.time = datetime.now()
#         self.secondary_mode = secondary_mode

# class Pool:
#     def __init__(self,
#                  pool_name,
#                  pvt_max_qty,
#                  pvt_price_initial,
#                  pvt_price_max,
#                  pool_secondary_mode_qty,
#                  steepness_primary):

#         self.hashid = hashlib.sha3_256(str(uuid.uuid4()).encode('utf-8')).hexdigest()
#         self.pool_name = pool_name

#         # a,b and c
#         self.a_price_initial_max_midpoint = (pvt_price_max-pvt_price_initial) / 2
#         self.b_max_qty_half = pvt_max_qty / 2
#         self.c_steepness_primary = steepness_primary

#         self.pvt_tokens_address = '0xaaaaa'
#         self.pvt_current_supply = pvt_max_qty

#         self.df_transactions =  pd.DataFrame(columns=['Curve Direction Move','Timestamp', 'Xth Token Transacted', 'Price', 'Secondary Mode'])
                
#         self.pvt_price_max = pvt_price_max
#         self.pvt_max_qty = pvt_max_qty
#         self.pvt_price_initial = pvt_price_initial
#         self.usdc_received = 0

#         # secondary mode
#         self.in_secondary_mode = False
#         self.secondary_mode_threshold = pvt_max_qty - pool_secondary_mode_qty
#         self.pool_secondary_mode_qty = pool_secondary_mode_qty
        
#         self.P = self.a_price_initial_max_midpoint * self.calc_y_m1_no_offset(1)
#         self.A_price_initial_max_midpoint = 2 * self.a_price_initial_max_midpoint
#         self.B_max_qty_half = 2 * self.b_max_qty_half
#         self.C_steepness_secondary = steepness_primary
#         self.L = self.price_at(self.B_max_qty_half) - self.A_price_initial_max_midpoint

#         print(f'p {self.P}')


#         print('lanching pool')
       
#     def generate_curve(self):
#         x = range(0,int(self.B_max_qty_half * 2))
#         y1 = [self.calc_y_m1(xi) for xi in x]
#         y2 = [self.calc_y_m2(xi) for xi in x]
#         plt.plot(x, y1, label='Primary Mode',  color='red')
#         plt.plot(x, y2, label='Secondary Mode', color='blue')
#         plt.xlabel('Token Supply')
#         plt.ylabel('Price')
#         plt.legend()
#         plt.title(f'Bonding Curve for {self.pool_name}')
#         plt.show()

#     def append_transaction_ledger(self,curve_dir,price):
#         self.df_transactions.loc[len(self.df_transactions)] = [curve_dir,datetime.now(),self.pvt_current_supply + curve_dir,price,self.in_secondary_mode]


#     def sell(self):
#         price = self.price_at(self.pvt_current_supply-1)
#         if self.in_secondary_mode:
#             self.usdc_received -= price
#             self.pvt_current_supply += 1
#             self.append_transaction_ledger(-1,price)

#         return price       

#     def buy(self):
#         price = self.price_at((self.pvt_max_qty - self.pvt_current_supply)+1)
#         print(f'buying at {price}')
#         self.usdc_received += price
#         self.pvt_current_supply -= 1
#         self.append_transaction_ledger(1,price)
#         if not self.in_secondary_mode and self.pvt_current_supply < self.secondary_mode_threshold:
#             print('Switiching to secondary mode')
#             self.in_secondary_mode = True
#         return price

#     def price_at(self,x):
#         return self.calc_y(x)
    
#     def calc_y(self,x):
#         if self.in_secondary_mode:
#             return self.calc_y_m2(x)
#         else:
#             return self.calc_y_m1(x)
        
#     def calc_y_m1_no_offset(self,x):
#         return self.a_price_initial_max_midpoint * (((x-self.b_max_qty_half)/math.sqrt(self.c_steepness_primary+((x-self.b_max_qty_half)**2))) + 1)
    
#     def calc_y_m1(self,x):
#         return self.a_price_initial_max_midpoint * (((x-self.b_max_qty_half)/math.sqrt(self.c_steepness_primary+((x-self.b_max_qty_half)**2))) + 1) + self.P

    
#     def calc_y_m2(self,x):
#         return self.A_price_initial_max_midpoint * (((x-self.B_max_qty_half)/math.sqrt(self.C_steepness_secondary+((x-self.B_max_qty_half)**2))) + 1) + self.L

#     def show_price_at(self,x):
#         price = self.price_at(x)
#         print(f'PVT Token #{x} for {self.pool_name} is ${price}')

#     def show_transaction_ledger(self):
#         print(self.df_transactions)    
    
#     def show_stats(self):
#         print(f'Tokens sold: {self.tokens_sold}')
#         print(f'USDC Received: {self.usdc_received}')
#         print(f'Transaction Count: {len(self.df_transactions)}')
#         print(f'Next Price: {self.calc_y(self.pvt_current_supply+1)}')
#         print(f'B {self.B_max_qty_half}') 
#         print(f'L {self.L}')     
        
# class RAMM:
#     STEEPNESS_FLATISH       = 10000000
#     STEEPNES_MODERATE       = 100000
#     STEEPNESS_MEDIUM        = 100000 
#     STEEPNESS_HIGH          = 10000
#     STEEPNESS_AGGRESSIVE    = 1000
#     def __init__(self):
#         self.pools = {}
#     def create_pool(self,pool_name,pvt_max_qty,pool_secondary_mode_qty,pvt_price_initial,pvt_price_max,steepness_primary):
#         np =  Pool(
#             pool_name=pool_name,
#             pvt_max_qty=pvt_max_qty,
#             pool_secondary_mode_qty=pool_secondary_mode_qty,
#             pvt_price_initial=pvt_price_initial,
#             pvt_price_max=pvt_price_max,
#             steepness_primary=steepness_primary)
#         self.pools[pool_name] = np
#         return np
#     def list_pools(self):
#         pools = PrettyTable()
#         pools.field_names = ["Pool Name", "PVT Qty", "Initial Price", "Max Price"]
#         for k,v in self.pools.items():
#             pools.add_row([k, v.b_max_qty_half, v.pvt_price_initial, v.pvt_price_max])
#         print(pools)
#     def show_chart(self,pool_name):
#         if pool_name in self.pools:
#             self.pools[pool_name].generate_curve()
#     def price_at(self,pool_name,x):
#         if pool_name in self.pools:
#             return self.pools[pool_name].price_at(x)
#         else: return -999
        

# usdc_testnet = Address(address='GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5')
# jamiel = Address(address='GBYZVGQMQIZJNNECEZ6PX4CB44E5IPG3SMVP45QTL5I4S4A7E6BNZITE')

# ramm = RAMM()
# nike_pool = ramm.create_pool(
#     pool_name='Nike',
#     pvt_max_qty=3000,
#     pvt_price_initial=100,
#     pvt_price_max=500,
#     pool_secondary_mode_qty=500,
#     steepness_primary=RAMM.STEEPNESS_MEDIUM) 
# #ramm.create_pool('AirJordan',5000,500,100,500,100000)
# #ramm.create_pool('DeltaAir',2000,2000,1000,500,100000)
# #ramm.list_pools()

# nike_pool.generate_curve()

# nike_pool.show_transaction_ledger()

# # #ramm.show_chart('Nike')

# # nike_pool.show_price_at(1)
# # nike_pool.show_price_at(200)
# # nike_pool.show_price_at(300)

# delay = 0
# # simulate buying
# for n in range(1):
#     nike_pool.buy()
#     time.sleep(delay)


# # nike_pool.show_stats()

# print(nike_pool.df_transactions.head())