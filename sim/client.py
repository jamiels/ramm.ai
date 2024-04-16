import requests

# URL of the FastAPI endpoint
url = "http://localhost:8000/api/v1/create-pool"  # Change to your actual FastAPI application URL

# JSON payload with the data for creating a pool
payload = {
    "pool_name": "Example Pool 2",
    "owner": "Alan",  # Replace with the actual wallet ID
    "pvt_available_secondary": 100,
    "pvt_qty_max_primary": 50,
    "pvt_price_max_primary": 10.0,
    "pvt_price_initial_primary": 5.0,
    "steepness": 10000
}
print('payload',payload)
# Headers to indicate that the payload is JSON
headers = {
    "Content-Type": "application/json"
}

# Making the POST request
response = requests.post(url, json=payload, headers=headers)
print(response)

# Checking the response
if response.status_code == 200:
    print("Pool created successfully.")
    print(response.json())  # Print the response JSON if needed
else:
    print("Failed to create pool.")
    print("Status code:", response.status_code)
    print("Response:", response.text)
