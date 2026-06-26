import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Enable JSON parsing with a higher limit for images/screenshots
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to persistent data folder
const DATA_DIR = path.join(process.cwd(), "data");

// Initialize data folder and files if they do not exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "customers.json");
const USERS_FILE = path.join(DATA_DIR, "registeredUsers.json");

// Initial products fallback (same as initialData.ts)
const initialProducts = [
  {
    pid: "P001",
    pname: "iPhone 15 Pro Max",
    category: "premium",
    brand: "Apple",
    price: 1299,
    stock: 12,
    status: "Active",
    ram: "8GB",
    storage: "256GB",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop",
    description: "ទូរស័ព្ទដៃស្មាតហ្វូនជំនាន់ចុងក្រោយរបស់ក្រុមហ៊ុន Apple ជាមួយបន្ទះឈីប A17 Pro និងតួខ្លួនធ្វើពី Titanium ដ៏រឹងមាំ។"
  },
  {
    pid: "P002",
    pname: "Galaxy S24 Ultra",
    category: "premium",
    brand: "Samsung",
    price: 1199,
    stock: 8,
    status: "Active",
    ram: "12GB",
    storage: "512GB",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop",
    description: "កំពូលទូរស័ព្ទរបស់ Samsung មកជាមួយប៊ិច S-Pen និងបច្ចេកវិទ្យា Galaxy AI ជំនួយការឆ្លាតវៃគ្រប់ការងារ។"
  },
  {
    pid: "P003",
    pname: "Xiaomi 14 Ultra",
    category: "camera",
    brand: "Xiaomi",
    price: 999,
    stock: 4,
    status: "Active",
    ram: "16GB",
    storage: "512GB",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
    description: "ស្មាតហ្វូនកំពូលកាមេរ៉ាសហការជាមួយ Leica ផ្ដិតយករូបភាពបានច្បាស់ត្រជាក់ភ្នែកគ្រប់ប្លង់។"
  },
  {
    pid: "P004",
    pname: "Galaxy Z Fold 5",
    category: "foldable",
    brand: "Samsung",
    price: 1599,
    stock: 2,
    status: "Active",
    ram: "12GB",
    storage: "512GB",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=600&auto=format&fit=crop",
    description: "ទូរស័ព្ទអេក្រង់បត់បើកធំទូលាយដូច Tablet សម្រួលការងារការិយាល័យ និងមើលកុនកម្សាន្ត។"
  },
  {
    pid: "P005",
    pname: "ROG Phone 8 Pro",
    category: "gaming",
    brand: "Xiaomi",
    price: 1099,
    stock: 6,
    status: "Active",
    ram: "24GB",
    storage: "1TB",
    image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=600&auto=format&fit=crop",
    description: "កំពូលស្មាតហ្វូនសម្រាប់លេងហ្គេម បំពាក់ប្រព័ន្ធត្រជាក់ និងឈីបខ្លាំងបំផុតកម្រិតពិភពលោក។"
  },
  {
    pid: "P006",
    pname: "Honor Magic 6 Pro",
    category: "honor",
    brand: "Honor",
    price: 899,
    stock: 15,
    status: "Active",
    ram: "12GB",
    storage: "512GB",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop",
    description: "Honor Magic 6 Pro មកជាមួយប្រព័ន្ធកាមេរ៉ា Falcon Camera កម្រិតអាជីព និងថាមពលថ្មធំកាន់បានយូរ។"
  }
];

const defaultUsers = [
  {
    name: "មាស សុខា",
    email: "user@gmail.com",
    password: "user123",
    phone: "012888999",
    address: "ផ្ទះលេខ ១២ ផ្លូវព្រះនរោត្តម ភ្នំពេញ"
  }
];

// Seed functions
const readJsonFile = (filePath: string, defaultValue: any) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  // Write default value if file doesn't exist or is corrupted
  try {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
  return defaultValue;
};

const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
};

// =========================================================================
// API ENDPOINTS
// =========================================================================

// GET all data
app.get("/api/data", (req, res) => {
  const products = readJsonFile(PRODUCTS_FILE, initialProducts);
  const orders = readJsonFile(ORDERS_FILE, []);
  const customers = readJsonFile(CUSTOMERS_FILE, []);
  const registeredUsers = readJsonFile(USERS_FILE, defaultUsers);

  res.json({
    products,
    orders,
    customers,
    registeredUsers
  });
});

// POST to save specific data type
app.post("/api/save", (req, res) => {
  const { type, data } = req.body;

  if (!type || !Array.isArray(data)) {
    return res.status(400).json({ error: "Invalid payload. Type and an array of data are required." });
  }

  let filePath = "";
  switch (type) {
    case "products":
      filePath = PRODUCTS_FILE;
      break;
    case "orders":
      filePath = ORDERS_FILE;
      break;
    case "customers":
      filePath = CUSTOMERS_FILE;
      break;
    case "registeredUsers":
      filePath = USERS_FILE;
      break;
    default:
      return res.status(400).json({ error: "Unsupported data type" });
  }

  const success = writeJsonFile(filePath, data);
  if (success) {
    res.json({ message: `Successfully saved ${type} to disk.` });
  } else {
    res.status(500).json({ error: `Failed to save ${type} to disk.` });
  }
});

// API status/health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", persistence: "disk" });
});

// =========================================================================
// VITE AND STATIC ASSETS SERVING
// =========================================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
