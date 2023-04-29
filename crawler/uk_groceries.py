import requests
import json
from bs4 import BeautifulSoup

# Define the list of UK-based grocery retailers and delivery services URLs
uk_grocers = [
	{
		'title': 'Leading 10 retailers in the UK 2022 | Statista',
		'href': 'https://www.statista.com/statistics/462863/leading-ten-retailers-by-sales-uk/'
	},
	{
		'title': 'ASDA Groceries | Online Food Shopping & Delivery',
		'href': 'https://groceries.asda.com/',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
	 	'active': True,
		'title': 'Ocado: The online supermarket',
		'href': 'https://www.ocado.com/webshop/startWebshop.do',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
		'title': 'Tesco Groceries | Online Food Shopping & Delivery | Order Food Online',
		'href': 'https://www.tesco.com/groceries/en-GB/',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
		'title': 'Sainsbury\'s | Home',
		'href': 'https://www.sainsburys.co.uk/',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
		'title': 'Iceland Groceries | Online Food Shopping & Delivery | Order Frozen Food Online',
		'href': 'https://www.iceland.co.uk/',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
		'title': 'Morrisons | Online Shopping | Food, Drink & More To Your Door',
		'href': 'https://groceries.morrisons.com/webshop/startWebshop.do',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
		'title': 'Cook - Cook Food. Try it at Home. Free delivery when you spend £40',
		'href': 'https://www.cookfood.net/',
		'navEl': 'div',
		'navClass': 'primaryBar-container',
		'productContainer': 'fop-item',
		'productElement': 'div',
		'productNameEl': 'h4',
		'productNameClass': 'fop-title',
		'productPriceEl': 'span',
		'productPriceClass': 'fop-price',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'fop-unit-price',
		'productReviewClass': 'fop-rating-inner',
		'productImageEl': 'img',
		'productImageClass': 'fop-img',
	},
	{
	 	'active': True,
		'title': 'Waitrose &amp; Partners | Food | Drink | Recipes',
		'href': 'https://www.waitrose.com/',
		'navEl': 'nav',
		'navClass': 'shopWindowWrapper___LlOlX',
		'productContainer': 'productPod___yz0mm',
		'productElement': 'article',
		'productNameEl': 'span',
		'productNameClass': 'name___h83Rn',
		'productPriceEl': 'span',
		'productPriceClass': 'itemPrice___3Cd0U',
		'productUnitPriceEl': 'span',
		'productUnitPriceClass': 'size___12Ngq',
		'productReviewClass': 'ratingText___2sGgC',
		'productImageEl': 'picture',
		'productImageClass': 'podImage___1YvPQ',
	}
]

# Define the products list, where all the product details will be temporarily stored
products = []

# Loop through the list of UK-based grocery websites and extract their product details
for grocer in uk_grocers:
	if 'active' not in grocer:
		print(f"Passing through {grocer['title']} because it is not active")
		continue

	URL = grocer['href']
	grocer_title = grocer['title']
	className = grocer['navClass']
	element = grocer['navEl']

	# Surround the code in a try/except block to handle any unforeseen exceptions gracefully
	try:
		# Send a GET request to the website and retrieve its content
		response = requests.get(URL)
		content = response.content
		# Pass the content to BeautifulSoup for parsing
		soup = BeautifulSoup(content, 'html.parser')
		# Find all category links within the navigation bar
		nav_categories = soup.find('div',{'class':'primaryBar-container'}).findAll('a')

		print(f'Found {len(nav_categories)} categories in the navbar')

		# Loop through each category link and scrape its product pages
		for category in nav_categories:
			category_name = category.text.strip()

			print(f'Processing category {category_name}')

			category_link = category['href']

			if category_link[0:5] != 'https':
				category_link = 'https://www.ocado.com' + category_link

			category_response = requests.get(category_link)
			print(f'Visiting category {category_link}')
			category_content = category_response.content
			category_soup = BeautifulSoup(category_content, 'html.parser')
			# Find all product links within the category page
			product_list = category_soup.findAll('div', {'class':'fop-item'})

			print(f'Found {len(product_list)} products on category {category_name}')

			try:
				for product in product_list:
					# Select the first link
					product_link = product.css.select_one('.fop-contentWrapper > a')

					if (product_link):
						product_link = product_link['href']
					else:
						print(f'Product {product} does not have a valid link so we are skipping it')
						continue

					if product_link[0:5] != 'https':
						product_link = 'https://www.ocado.com' + product_link

					print(f'Visiting product link {product_link}')
					product_page = requests.get(product_link).content
					product_content = BeautifulSoup(product_page, 'html.parser')

					# Visit the single product page to copy data
					# BRB...
					product_header = product_content.find('header',{'class':'bop-title'})

					# Get the product name before the comment tag: <!-- -->
					product_name = " ".join(product_header.h1.text.strip().split(' ')[0:-1])
					print(f'Product name = {product_name}')

					# Get the size before the comment tag: <!-- -->
					product_size = product_header.h1.text.strip().split(' ')[-1]
					print(f'Product size = {product_size}')

					# Get product sidebar
					product_sidebar = product_content.find('section', { 'class': 'bop-section bop-basicInfo'})

					# Get product price
					product_price = product_sidebar.css.select_one('.bop-price >  .bop-price__wrapper > h2').text.strip().split()[0]

					# Get product size
					product_unit_price = product_sidebar.css.select_one('.bop-price >  .bop-price__wrapper > .bop-price__per').text.strip()
					print(f'Product unit price is {product_unit_price}')

					# Get the product image
					product_div = product_content.find('div', {'class': 'bop-gallery'})
					product_image = product_div.div.div.img['src']
					if product_image[0:5] != 'https':
						product_image = 'https://www.ocado.com' + product_image

					# product_description = product_content.find()

					product_category = category_name

					productMetaWrapper = product_content.find_all('.gn-accordionElement')

					header = None
					body = None

					for meta in productMetaWrapper:
						header = meta.css.select_one('.gn-expandableBar > .gn-expandableBar__wrapper > .gn-expandableBar__header').text.strip()
						body = meta.css.select_one('.gn-accordionElement__content').text.strip()

					productMeta = {}

					productMeta[header] = body

					# Append extracted information to the products list
					product_dict = {
						'title': product_name,
						'link': product_link,
						'price': product_price,
						'size': product_size,
						'unit_price': product_unit_price,
						'product_category': product_category,
						'images': [product_image],
						'grocer_name': grocer_title,
						'productMeta': productMeta
					}

					products.append(product_dict)

					# Print a message to confirm that the website's products have been successfully extracted
					print(f'Finished crawling product {product_name}.')

			except (NameError, AttributeError) as e:
				# Save product information in a JSON file
				with open('uk_grocery_products.json', 'w') as f:
					json.dump(products, f, indent=4)
				print(f'Error occurred on product page {e}')

	except Exception as e:
		# Save product information in a JSON file
		with open('uk_grocery_products.json', 'w') as f:
			json.dump(products, f, indent=4)
		# Display an error message when the code cannot extract information from the website
		print(f'Error extracting from {grocer_title}. Error message: {str(e)} {e.__l}')

# Save product information in a JSON file
with open('uk_grocery_products.json', 'w') as f:
	json.dump(products, f, indent=4)