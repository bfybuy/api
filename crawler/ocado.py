import requests
import json
import re
import demjson
from bs4 import BeautifulSoup

# Define the products list, where all the product details will be temporarily stored
products = []

try:
	# Send a GET request to the website and retrieve its content
	response = requests.get('https://www.ocado.com/browse/fresh-chilled-food-20002')
	content = response.content

	soup = BeautifulSoup(content, "html.parser")

	# Create a regular expression pattern to search for
	pattern = re.compile(r"window\.INITIAL_STATE = \{.*?\}", re.DOTALL)

	# Find the script element and extract its text content
	script_element = soup.find_all("script", string=pattern)

	for match in script_element:
		# Extract the value of the INITIAL_STATE property
		script_text = match.text.strip()
		# initial_state = eval(script_text.split("=")[1].strip())
		script_text = script_text.split("=")[1].strip()

		try:
			initial_state = demjson.decode(script_text)
			print(initial_state)
		except json.JSONDecodeError:
			# The JSON string is broken
			initial_state = demjson.decode(script_text + '}')
			print(initial_state)
		# print(f'Found initial state to be {script_text}')
except Exception as e:
		# Display an error message when the code cannot extract information from the website
		print(f'Error extracting from ocado. Error message: {str(e)}')

# Save product information in a JSON file
with open('uk_grocery_products.json', 'w') as f:
	json.dump(products, f, indent=4)