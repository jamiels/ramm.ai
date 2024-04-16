# This example shows how to deploy a compiled contract to the Stellar network.
# https://github.com/stellar/soroban-quest/blob/main/quests/6-asset-interop/py-scripts/deploy-contract.py

import time

from stellar_sdk import Network, Keypair, TransactionBuilder
from stellar_sdk import xdr as stellar_xdr

from stellar_sdk import SorobanServer
#from stellar_sdk import TransactionStatus

# TODO: You need to replace the following parameters according to the actual situation
secret = "SAAPYAPTTRZMCUZFPG3G66V4ZMHTK4TWA6NS7U4F7Z3IMUD52EK4DDEV"
rpc_server_url = "https://soroban-testnet.stellar.org"
network_passphrase = Network.TESTNET_NETWORK_PASSPHRASE
contract_file_path = "/path/to/compiled/soroban_contract.wasm"

kp = Keypair.from_secret(secret)
kp = Keypair.from_mnemonic_phrase("ask champion valley garment unable anchor smooth leaf payment stereo ketchup inject")
soroban_server = SorobanServer(rpc_server_url)

print("installing contract...")
source = soroban_server.load_account(kp.public_key)

# with open(contract_file_path, "rb") as f:
#     contract_bin = f.read()

tx = (
    TransactionBuilder(source, network_passphrase)
    .set_timeout(300).append_upload_contract_wasm_op(
        contract=contract_file_path,  # the path to the contract, or binary data
        source=kp.public_key,
    )
    .build()
)
print(tx)