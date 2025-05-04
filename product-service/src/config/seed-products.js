const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("./logger");

// Load environment variables
dotenv.config();

// Import the Product model
const Product = require("../models/Product");

// Connect to MongoDB
mongoose
    .connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/product-service"
    )
    .then(() => logger.info("MongoDB connected for seeding"))
    .catch((err) => {
        logger.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Sample categories
const categories = [
    "electronics",
    "clothing",
    "books",
    "home",
    "beauty",
    "toys",
    "sports",
    "automotive",
    "garden",
    "office",
];

// Sample product names by category
const productNames = {
    electronics: [
        "Smartphone",
        "Laptop",
        "Tablet",
        "Headphones",
        "Smartwatch",
        "Camera",
        "Drone",
        "Speaker",
        "TV",
        "Gaming Console",
    ],
    clothing: [
        "T-Shirt",
        "Jeans",
        "Dress",
        "Jacket",
        "Sweater",
        "Shorts",
        "Socks",
        "Hat",
        "Shoes",
        "Gloves",
    ],
    books: [
        "Novel",
        "Cookbook",
        "Biography",
        "Textbook",
        "Self-Help Book",
        "Children's Book",
        "Comic Book",
        "Science Fiction",
        "Mystery",
        "History Book",
    ],
    home: [
        "Couch",
        "Bed",
        "Table",
        "Chair",
        "Lamp",
        "Rug",
        "Curtains",
        "Pillow",
        "Blanket",
        "Kitchenware",
    ],
    beauty: [
        "Lipstick",
        "Shampoo",
        "Perfume",
        "Face Cream",
        "Soap",
        "Nail Polish",
        "Makeup Kit",
        "Hair Dryer",
        "Face Mask",
        "Lotion",
    ],
    toys: [
        "Action Figure",
        "Board Game",
        "Puzzle",
        "Doll",
        "Remote Control Car",
        "Building Blocks",
        "Card Game",
        "Stuffed Animal",
        "Educational Toy",
        "Outdoor Toy",
    ],
    sports: [
        "Basketball",
        "Tennis Racket",
        "Soccer Ball",
        "Yoga Mat",
        "Weights",
        "Bicycle",
        "Golf Club",
        "Running Shoes",
        "Swimming Goggles",
        "Fitness Tracker",
    ],
    automotive: [
        "Car Seat",
        "Tire",
        "Brake Pad",
        "Car Wax",
        "Oil Filter",
        "Car Cover",
        "Floor Mat",
        "Dash Cam",
        "Jump Starter",
        "Tool Kit",
    ],
    garden: [
        "Plant Pot",
        "Garden Hose",
        "Lawn Mower",
        "Seeds",
        "Fertilizer",
        "Garden Tools",
        "Outdoor Furniture",
        "Bird Feeder",
        "Decorative Stone",
        "Tree",
    ],
    office: [
        "Notebook",
        "Pen Set",
        "Desk",
        "Office Chair",
        "Stapler",
        "Paper Shredder",
        "Desk Organizer",
        "Desk Lamp",
        "Calendar",
        "Whiteboard",
    ],
};

// Sample adjectives to make product names more varied
const adjectives = [
    "Premium",
    "Deluxe",
    "Professional",
    "Advanced",
    "Modern",
    "Classic",
    "Eco-friendly",
    "Smart",
    "Portable",
    "Wireless",
    "High-Performance",
    "Ultra-Lightweight",
    "Compact",
    "Durable",
    "Limited Edition",
];

// Sample brands by category
const brands = {
    electronics: [
        "Samsung",
        "Apple",
        "Sony",
        "LG",
        "Bose",
        "Dell",
        "HP",
        "Asus",
        "Canon",
        "Nikon",
    ],
    clothing: [
        "Nike",
        "Adidas",
        "H&M",
        "Zara",
        "Levi's",
        "Gap",
        "Under Armour",
        "Gucci",
        "Calvin Klein",
        "Ralph Lauren",
    ],
    books: [
        "Penguin",
        "Random House",
        "HarperCollins",
        "Simon & Schuster",
        "Macmillan",
        "Scholastic",
        "Oxford",
        "Hachette",
        "Wiley",
        "Pearson",
    ],
    home: [
        "IKEA",
        "Wayfair",
        "Ashley",
        "Pottery Barn",
        "Crate & Barrel",
        "West Elm",
        "La-Z-Boy",
        "Restoration Hardware",
        "Williams-Sonoma",
        "Bed Bath & Beyond",
    ],
    beauty: [
        "L'Oreal",
        "Maybelline",
        "MAC",
        "Estee Lauder",
        "Clinique",
        "Dove",
        "Nivea",
        "Olay",
        "Pantene",
        "Garnier",
    ],
    toys: [
        "LEGO",
        "Hasbro",
        "Mattel",
        "Fisher-Price",
        "Playmobil",
        "Nerf",
        "Hot Wheels",
        "Barbie",
        "Disney",
        "Nintendo",
    ],
    sports: [
        "Nike",
        "Adidas",
        "Under Armour",
        "Puma",
        "Reebok",
        "New Balance",
        "Asics",
        "Wilson",
        "Head",
        "Mizuno",
    ],
    automotive: [
        "Bosch",
        "Michelin",
        "Mobil 1",
        "Castrol",
        "Valvoline",
        "NGK",
        "Denso",
        "Continental",
        "Bridgestone",
        "Goodyear",
    ],
    garden: [
        "Scotts",
        "Miracle-Gro",
        "Fiskars",
        "Gardena",
        "Husqvarna",
        "Black & Decker",
        "DeWalt",
        "Craftsman",
        "Greenworks",
        "Toro",
    ],
    office: [
        "Staples",
        "Office Depot",
        "3M",
        "Sharpie",
        "Post-it",
        "HP",
        "Canon",
        "Epson",
        "Brother",
        "Dell",
    ],
};

// Generate a random number between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random price
function getRandomPrice(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Generate a random product
function generateProduct() {
    const category = categories[getRandomInt(0, categories.length - 1)];
    const name =
        productNames[category][
            getRandomInt(0, productNames[category].length - 1)
        ];
    const adjective = adjectives[getRandomInt(0, adjectives.length - 1)];
    const brand =
        brands[category][getRandomInt(0, brands[category].length - 1)];
    const price = getRandomPrice(10, 1000);
    const stock = getRandomInt(0, 100);
    const rating = getRandomPrice(1, 5);
    const numReviews = getRandomInt(0, 1000);

    return {
        name: `${adjective} ${brand} ${name}`,
        description: `High-quality ${category} product from ${brand}. ${adjective} features and design.`,
        price,
        category,
        brand,
        stock,
        rating,
        numReviews,
        images: [
            `https://example.com/images/${category}/${name
                .toLowerCase()
                .replace(/\s+/g, "-")}-1.jpg`,
            `https://example.com/images/${category}/${name
                .toLowerCase()
                .replace(/\s+/g, "-")}-2.jpg`,
        ],
    };
}

// Create and insert products
async function seedProducts() {
    try {
        // Clear existing products
        await Product.deleteMany({});
        logger.info("Cleared existing products");

        // Generate and insert 100 products
        const products = Array.from({ length: 100 }, generateProduct);
        await Product.insertMany(products);
        logger.info(`Successfully seeded ${products.length} products`);

        // Display some sample products
        logger.info("\nSample products:");
        for (let i = 0; i < 5; i++) {
            logger.info(`- ${products[i].name} ($${products[i].price})`);
        }

        // Disconnect from database
        mongoose.disconnect();
        logger.info("\nDatabase connection closed");
        process.exit(0);
    } catch (error) {
        logger.error("Error seeding products:", error);
        mongoose.disconnect();
        process.exit(1);
    }
}

// Run the seeding function
seedProducts();
